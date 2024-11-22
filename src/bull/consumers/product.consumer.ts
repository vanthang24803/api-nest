import { Photo, Option } from "@/database/entities";
import { ProductEvent, ProductProcess } from "@/shared/events";
import { Process, Processor } from "@nestjs/bull";
import { BadRequestException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Job } from "bull";
import { DataSource, Repository } from "typeorm";
import { CreateProductHandler } from "./handler";
import { UploadService } from "@/common";

@Processor(ProductEvent)
export class ProductConsumer {
  constructor(
    private readonly logger: Logger,
    private readonly upload: UploadService,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
    private readonly dataSource: DataSource,
  ) {}

  @Process(ProductProcess.Create)
  public async createProduct(job: Job<CreateProductHandler>) {
    const { productId, options, photos } = job.data;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      const optionPromises = options.map((option) => {
        const newOption = this.optionRepository.create({
          ...option,
          productId,
        });
        return queryRunner.manager.save(newOption);
      });

      await Promise.all(optionPromises);

      const photoPromises = photos.map(async (photo) => {
        const uploadPhoto = await this.upload.uploadImage(photo);
        const newPhoto = this.photoRepository.create({
          url: uploadPhoto,
          productId,
        });

        return queryRunner.manager.save(newPhoto);
      });

      await Promise.all(photoPromises);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error("Error creating product:", err);
      throw new BadRequestException(
        "Error creating product. Please check the logs for details.",
      );
    } finally {
      await queryRunner.release();
    }
  }
}
