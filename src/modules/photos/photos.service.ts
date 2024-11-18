import { UntilService, UploadService } from "@/common";
import { Photo, Product } from "@/database/entities";
import { BaseQuery, IPagination, NormalResponse } from "@/shared";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { PhotoDelete, PhotoResponse } from "./dto";
import { RedisService } from "@/redis/redis.service";

@Injectable()
export class PhotosService {
  constructor(
    private readonly util: UntilService,
    private readonly logger: Logger,
    private readonly upload: UploadService,
    private readonly redis: RedisService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Photo)
    private readonly photoService: Repository<Photo>,
    private readonly dataSource: DataSource,
  ) {}

  public async save(
    productId: string,
    files: Express.Multer.File[],
  ): Promise<NormalResponse> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingProduct = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (!existingProduct) {
        throw new NotFoundException("Product not found!");
      }

      await this.redis.del(`Product_${existingProduct.id}`);

      if (files.length > 0) {
        const photoPromises = files.map(async (file) => {
          const fileUpload = await this.upload.uploadImage(file);

          const newPhoto = this.photoService.create({
            url: fileUpload,
            productId: existingProduct.id,
          });

          return queryRunner.manager.save(newPhoto);
        });

        await Promise.all(photoPromises);
      }

      await queryRunner.commitTransaction();

      return this.util.buildCreatedResponse({
        message: "Photos created successfully!",
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

    const [photos, total] = await this.photoService.findAndCount({
      where: {
        productId,
      },
    });

    const result: IPagination<PhotoResponse> = {
      page,
      limit,
      size: total,
      totalPage: Math.ceil(total / limit),
      result: this.util.mapToDto(
        photos.map((photo) => ({
          ...photo,
          url: this.util.combinePhotoPaths(photo.url),
        })),
        PhotoResponse,
      ) as PhotoResponse[],
    };

    return this.util.buildSuccessResponse(result);
  }

  public async findOne(
    productId: string,
    photoId: string,
  ): Promise<NormalResponse> {
    const existingPhoto = await this.photoService.findOne({
      where: {
        id: photoId,
        productId,
      },
    });

    if (!existingPhoto) throw new NotFoundException("Photo not found!");

    return this.util.buildSuccessResponse({
      ...existingPhoto,
      url: this.util.combinePhotoPaths(existingPhoto.url),
    });
  }

  public async update(
    productId: string,
    photoId: string,
    file: Express.Multer.File,
  ): Promise<NormalResponse> {
    try {
      await this.redis.del(`Product_${productId}`);

      const existingPhoto = await this.photoService.findOne({
        where: {
          id: photoId,
          productId,
        },
      });

      if (!existingPhoto) throw new NotFoundException("Photo not found!");

      await this.upload.removeImage(existingPhoto.url);

      const resultUpload = await this.upload.uploadImage(file);

      existingPhoto.url = resultUpload;

      this.photoService.save(existingPhoto);

      return this.util.buildSuccessResponse({
        message: "Update photo successfully!",
      });
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  public async remove(productId: string, files: PhotoDelete[]) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingProduct = await this.productRepository.findOne({
        where: { id: productId },
      });

      if (!existingProduct) throw new NotFoundException("Product not found!");

      await this.redis.del(`Product_${existingProduct.id}`);

      if (files.length > 0) {
        const deletePromises = files.map(async (file) => {
          const photo = await this.photoService.findOne({
            where: {
              productId,
              id: file.id,
            },
          });

          if (!photo) throw new NotFoundException("Photo not found!");

          await this.upload.removeImage(photo.url);

          await queryRunner.manager.remove(photo);
        });

        await Promise.all(deletePromises);
      }

      await queryRunner.commitTransaction();

      return this.util.buildSuccessResponse({
        message: "Deleted Photos Successfully!",
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
