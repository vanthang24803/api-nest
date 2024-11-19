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
import { DataSource, Repository } from "typeorm";
import { OrderRequest } from "./dto";
import { EOrderStatus, NormalResponse } from "@/shared";

@Injectable()
export class OrdersService {
  constructor(
    private readonly logger: Logger,
    private readonly util: UntilService,
    private readonly dataSource: DataSource,
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

      await this.bull.add(OrderEventProcess.SendMaiOrder, {
        ...newOrder,
        status: [newStatusOrder],
        orderDetails: detailResult,
      } as Order);

      await queryRunner.commitTransaction();

      return this.util.buildSuccessResponse({
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
}
