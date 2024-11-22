import { UntilService } from "@/common";
import {
  Option,
  Order,
  OrderDetail,
  OrderStatus,
  User,
} from "@/database/entities";
import { OrderEvent, OrderEventProcess } from "@/shared/events";
import { InjectQueue } from "@nestjs/bull";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Queue } from "bull";
import { DataSource, IsNull, Repository } from "typeorm";
import { BaseQuery, EOrderStatus, IPagination, NormalResponse } from "@/shared";
import { RedisService } from "@/redis/redis.service";
import { SendOrderMailHandler } from "@/bull/consumers/handler";
import { plainToInstance } from "class-transformer";
import { OrderResponse, OrderRequest, UserUpdateOrder } from "./dto";

@Injectable()
export class OrdersService {
  constructor(
    private readonly logger: Logger,
    private readonly util: UntilService,
    private readonly dataSource: DataSource,
    private readonly redis: RedisService,
    @InjectQueue(OrderEvent)
    private readonly bull: Queue,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
  ) {}

  public async save(
    user: User,
    request: OrderRequest,
  ): Promise<NormalResponse> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    await this.redis.reset();

    try {
      const { detail, ...orderInfo } = request;

      const newOrder = this.orderRepository.create({
        ...orderInfo,
        userId: user.id,
        status: [],
        orderDetails: [],
      });
      await queryRunner.manager.save(newOrder);

      const newStatusOrder = this.orderStatusRepository.create({
        status: EOrderStatus.PENDING,
        orderId: newOrder.id,
      });
      await queryRunner.manager.save(newStatusOrder);

      const detailResult: OrderDetail[] = [];

      const detailPromises = detail.map(async (item) => {
        const existingOption = await this.optionRepository.findOne({
          where: {
            productId: item.productId,
            id: item.optionId,
          },
        });

        if (!existingOption) {
          throw new NotFoundException(
            `Option not found for productId ${item.productId} and optionId ${item.optionId}`,
          );
        }

        const newOrderDetail = this.orderDetailRepository.create({
          ...item,
          orderId: newOrder.id,
        });
        await queryRunner.manager.save(newOrderDetail);

        await queryRunner.manager.update(Option, existingOption.id, {
          quantity: existingOption.quantity - newOrderDetail.quantity,
        });

        detailResult.push(newOrderDetail);
      });

      await Promise.all(detailPromises);

      const orderMessage: Order = {
        ...newOrder,
        status: [newStatusOrder],
        orderDetails: detailResult,
      } as Order;

      await this.bull.add(OrderEventProcess.SendMaiOrder, {
        subject: "Xác nhận đơn hàng",
        message: orderMessage,
      } as SendOrderMailHandler);

      await queryRunner.commitTransaction();

      return this.util.buildCreatedResponse({
        message: "Created order successfully!",
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err);
      throw new BadRequestException(
        err.message || "An error occurred while saving the order.",
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAllOrdersForUser(
    user: User,
    query: BaseQuery,
  ): Promise<NormalResponse> {
    const { limit, page } = query;

    const cacheKey = `Orders_${user.email}_${limit}_${query}`;

    const cacheData = await this.redis.get<NormalResponse>(cacheKey);

    if (cacheData) return cacheData;

    const [orders, total] = await this.orderRepository.findAndCount({
      where: {
        userId: user.id,
        deletedAt: IsNull(),
      },
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        status: true,
      },
    });

    const mappingData = await Promise.all(
      orders.map(async (order) => {
        const orderDetails = await this.orderDetailRepository.find({
          where: {
            orderId: order.id,
          },
        });

        return {
          ...order,
          orderDetails,
        } as Order;
      }),
    );

    const result: IPagination<OrderResponse> = {
      page,
      limit,
      size: total,
      totalPage: Math.ceil(total / limit),
      result: plainToInstance(OrderResponse, mappingData),
    };

    const response = this.util.buildSuccessResponse(result);

    await this.redis.set(cacheKey, response);

    return response;
  }

  async findAllOrdersForManager(query: BaseQuery): Promise<NormalResponse> {
    const { limit, page } = query;

    const cacheKey = `Manager_Orders_${limit}_${query}`;

    const cacheData = await this.redis.get<NormalResponse>(cacheKey);

    if (cacheData) return cacheData;

    const [orders, total] = await this.orderRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        status: true,
      },
    });

    const mappingData = await Promise.all(
      orders.map(async (order) => {
        const orderDetails = await this.orderDetailRepository.find({
          where: {
            orderId: order.id,
          },
        });

        return {
          ...order,
          orderDetails,
        } as Order;
      }),
    );

    const result: IPagination<OrderResponse> = {
      page,
      limit,
      size: total,
      totalPage: Math.ceil(total / limit),
      result: plainToInstance(OrderResponse, mappingData),
    };

    const response = this.util.buildSuccessResponse(result);

    await this.redis.set(cacheKey, response);

    return response;
  }

  async findOneOrder(id: string): Promise<NormalResponse> {
    const cacheKey = `Order_${id}`;

    const cache = await this.redis.get<NormalResponse>(cacheKey);

    if (cache) return cache;

    const existingOrder = await this.orderRepository.findOne({
      where: {
        deletedAt: IsNull(),
        id,
      },
    });

    if (!existingOrder) throw new NotFoundException("Order not found!");

    const orderDetails = await this.orderDetailRepository.find({
      where: {
        orderId: existingOrder.id,
      },
    });

    const orderResult = {
      ...existingOrder,
      orderDetails,
    } as Order;

    const result = this.util.buildSuccessResponse(
      plainToInstance(OrderResponse, orderResult),
    );

    await this.redis.set(cacheKey, result);

    return result;
  }

  async updateByUser(
    user: User,
    orderId: string,
    request: UserUpdateOrder,
  ): Promise<NormalResponse> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.redis.del(`Order_${orderId}`);

      const existingOrder = await this.orderRepository.findOne({
        where: {
          deletedAt: IsNull(),
          id: orderId,
          userId: user.id,
        },
      });

      if (!existingOrder) {
        throw new NotFoundException("Order not found!");
      }

      const orderDetails = await this.orderDetailRepository.find({
        where: {
          orderId: existingOrder.id,
        },
      });

      await queryRunner.manager.update(
        this.orderRepository.target,
        { id: existingOrder.id },
        { ...request },
      );

      await queryRunner.commitTransaction();

      const updatedOrder = await this.orderRepository.findOne({
        where: { id: existingOrder.id },
      });

      if (!updatedOrder) {
        throw new NotFoundException("Failed to fetch the updated order.");
      }

      const orderResult = {
        ...updatedOrder,
        orderDetails,
      } as Order;

      await this.bull.add(OrderEventProcess.SendMaiOrder, {
        subject: "Đơn hàng của bạn đã được cập nhật",
        message: orderResult,
      } as SendOrderMailHandler);

      const result = this.util.buildSuccessResponse({
        message: "Updated order successfully!",
      });
      await this.redis.set(`Order_${orderId}`, result);

      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err);
      throw new BadRequestException(
        err.message || "An error occurred while updating the order.",
      );
    } finally {
      await queryRunner.release();
    }
  }
}
