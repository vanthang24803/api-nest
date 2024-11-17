import { UntilService } from "@/common";
import { Product, Option } from "@/database/entities";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { OptionDelete, OptionRequest, OptionResponse } from "./dto";
import { BaseQuery, IPagination, NormalResponse } from "@/shared";
import { RedisService } from "@/redis/redis.service";

@Injectable()
export class OptionsService {
  constructor(
    private readonly util: UntilService,
    private readonly logger: Logger,
    private readonly redis: RedisService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
    private readonly dataSource: DataSource,
  ) {}

  public async save(
    productId: string,
    request: OptionRequest[],
  ): Promise<NormalResponse> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingProduct = await this.productRepository.findOne({
        where: {
          id: productId,
        },
      });

      await this.redis.del(`Product_${existingProduct.id}`);

      if (!existingProduct) throw new NotFoundException("Product not found!");

      await Promise.all(
        request.map(async (option) => {
          const newOption = this.optionRepository.create({
            ...option,
            productId: existingProduct.id,
          });
          return await queryRunner.manager.save(newOption);
        }),
      );

      await queryRunner.commitTransaction();

      return this.util.buildCreatedResponse({
        message: "Options created successfully!",
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err);
      throw new BadRequestException(err);
    } finally {
      await queryRunner.release();
    }
  }

  public async findAll(
    productId: string,
    query: BaseQuery,
  ): Promise<NormalResponse> {
    const { limit, page } = query;

    const [options, total] = await this.optionRepository.findAndCount({
      where: {
        productId,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const result: IPagination<OptionResponse> = {
      page,
      limit,
      size: total,
      totalPage: Math.ceil(total / limit),
      result: this.util.mapToDto(options, OptionResponse) as OptionResponse[],
    };

    return this.util.buildSuccessResponse(result);
  }

  public async findOne(
    productId: string,
    optionId: string,
  ): Promise<NormalResponse> {
    const existingOption = await this.optionRepository.findOne({
      where: {
        id: optionId,
        productId,
      },
    });

    if (!existingOption) throw new NotFoundException("Option not found!");

    return this.util.buildSuccessResponse(existingOption);
  }

  public async update(
    productId: string,
    optionId: string,
    request: OptionRequest,
  ): Promise<NormalResponse> {
    await this.redis.del(`Product_${productId}`);

    const existingOption = await this.optionRepository.findOne({
      where: {
        id: optionId,
        productId,
      },
    });

    if (!existingOption) throw new NotFoundException("Option not found!");

    await this.optionRepository.update(existingOption.id, {
      ...request,
    });

    return this.util.buildSuccessResponse({
      message: "Updated option successfully!",
    });
  }

  public async remove(
    productId: string,
    request: OptionDelete[],
  ): Promise<NormalResponse> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingProduct = await this.productRepository.findOne({
        where: {
          id: productId,
        },
      });

      if (!existingProduct) throw new NotFoundException("Product not found!");

      await this.redis.del(`Product_${existingProduct.id}`);

      if (request.length > 0) {
        const deletePromises = request.map(async (item) => {
          const option = await this.optionRepository.findOne({
            where: {
              id: item.id,
              productId,
            },
          });

          if (!option) {
            throw new NotFoundException(`Option with ID ${item.id} not found!`);
          }

          await queryRunner.manager.remove(option);
        });

        await Promise.all(deletePromises);
      }

      await queryRunner.commitTransaction();

      return this.util.buildSuccessResponse({
        message: "Deleted Options Successfully!",
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err);
      throw new BadRequestException(err);
    } finally {
      await queryRunner.release();
    }
  }
}
