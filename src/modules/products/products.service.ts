import { UntilService, UploadService } from "@/common";
import { Catalog, Product } from "@/database/entities";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { ProductRequest, UpdateProductRequest } from "./dto";
import { BaseQuery, IPagination, NormalResponse } from "@/shared";
import { ProductResponse } from "./dto/product.response";
import { CatalogResponse } from "../catalog/dto";
import { OptionResponse } from "../options/dto";
import { plainToInstance } from "class-transformer";
import { PhotoResponse } from "../photos/dto";
import { RedisService } from "@/redis/redis.service";
import { InjectQueue } from "@nestjs/bull";
import { ProductEvent, ProductProcess } from "@/shared/events";
import { Queue } from "bull";
import { CreateProductHandler } from "@/bull/consumers/handler";

@Injectable()
export class ProductsService {
  constructor(
    private readonly logger: Logger,
    private readonly util: UntilService,
    private readonly upload: UploadService,
    private readonly redis: RedisService,
    @InjectQueue(ProductEvent)
    private readonly bull: Queue,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Catalog)
    private readonly catalogRepository: Repository<Catalog>,
    private readonly dataSource: DataSource,
  ) {}

  public async save(
    request: ProductRequest,
    thumbnail: Express.Multer.File,
    filePhotos: Express.Multer.File[],
  ): Promise<NormalResponse> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    await this.redis.reset();

    try {
      const uploadThumbnail = await this.upload.uploadImage(thumbnail);

      const newProduct = this.productRepository.create({
        name: request.name,
        brand: request.brand,
        thumbnail: uploadThumbnail,
        introduction: request.introduction,
        specifications: request.introduction,
        options: [],
        photos: [],
        catalogs: [],
      });

      await queryRunner.manager.save(newProduct);

      const catalogs = await Promise.all(
        request.catalogs.map(async (catalog) => {
          const existingCatalog = await this.catalogRepository.findOne({
            where: { id: catalog.id },
          });
          if (!existingCatalog)
            throw new NotFoundException("Catalog not found!");
          return existingCatalog;
        }),
      );

      newProduct.catalogs = catalogs;

      await queryRunner.manager.save(newProduct);

      await queryRunner.commitTransaction();

      await this.bull.add(ProductProcess.Create, {
        productId: newProduct.id,
        options: request.options,
        photos: filePhotos,
      } as CreateProductHandler);

      return this.util.buildCreatedResponse({
        message: "Created Product Successfully!",
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err);
      throw new BadRequestException(err);
    } finally {
      await queryRunner.release();
    }
  }

  public async findAll(query: BaseQuery): Promise<NormalResponse> {
    const { limit, page } = query;

    const cacheKey = `Products_${limit}_${page}`;

    const cache = await this.redis.get<NormalResponse>(cacheKey);

    if (cache) return cache;

    const [products, total] = await this.productRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        catalogs: true,
        options: true,
        photos: true,
      },
    });

    const result: IPagination<ProductResponse> = {
      page,
      limit,
      size: total,
      totalPage: Math.ceil(total / limit),
      result: products.map((product) =>
        plainToInstance(ProductResponse, {
          ...product,
          thumbnail: this.util.combinePhotoPaths(product.thumbnail),
          catalogs: this.util.mapToDto(product.catalogs, CatalogResponse),
          options: this.util.mapToDto(product.options, OptionResponse),
          photos: this.util.mapToDto(
            product.photos.map((photo) => ({
              ...photo,
              url: this.util.combinePhotoPaths(photo.url),
            })),
            PhotoResponse,
          ),
        }),
      ),
    };

    const response = this.util.buildSuccessResponse(result);

    await this.redis.set(cacheKey, response);

    return response;
  }

  public async findOne(id: string): Promise<NormalResponse> {
    const cacheKey = `Product_${id}`;

    const cache = await this.redis.get<NormalResponse>(cacheKey);

    if (cache) {
      return cache;
    }

    const existingProduct = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: {
        options: true,
        catalogs: true,
        photos: true,
      },
    });

    if (!existingProduct) throw new NotFoundException("Product not found!");

    const jsonResponse = {
      ...existingProduct,
      thumbnail: this.util.combinePhotoPaths(existingProduct.thumbnail),
      catalogs: this.util.mapToDto(existingProduct.catalogs, CatalogResponse),
      options: this.util.mapToDto(existingProduct.options, OptionResponse),
      photos: this.util.mapToDto(
        existingProduct.photos.map((photo) => ({
          ...photo,
          url: this.util.combinePhotoPaths(photo.url),
        })),
        PhotoResponse,
      ),
    };

    const result = this.util.buildSuccessResponse(jsonResponse);

    await this.redis.set(cacheKey, result, 60 * 10);

    return result;
  }

  public async update(
    id: string,
    request: UpdateProductRequest,
  ): Promise<NormalResponse> {
    const existingProduct = await this.productRepository.findOne({
      where: {
        id,
      },
    });

    if (!existingProduct) throw new NotFoundException("Product not found!");

    await this.redis.del(`Product_${existingProduct.id}`);

    await this.productRepository.update(existingProduct.id, {
      ...request,
    });

    return this.util.buildSuccessResponse({
      message: "Product updated successfully!",
    });
  }

  public async remove(id: string): Promise<NormalResponse> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingProduct = await queryRunner.manager.findOne(Product, {
        where: { id },
        relations: { photos: true },
      });

      if (!existingProduct) throw new NotFoundException("Product not found!");

      await this.redis.del(`Product_${existingProduct.id}`);

      for (const photo of existingProduct.photos) {
        await this.upload.removeImage(photo.url);
      }

      await queryRunner.manager.remove(Product, existingProduct);

      await queryRunner.commitTransaction();

      return this.util.buildSuccessResponse({
        message: "Product deleted successfully!",
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
