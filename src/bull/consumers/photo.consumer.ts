import { UntilService, UploadService } from "@/common";
import { PhotoEvent, PhotoProcess } from "@/shared/events";
import { Process, Processor } from "@nestjs/bull";
import { BadRequestException, Logger, NotFoundException } from "@nestjs/common";
import { Job } from "bull";
import { DataSource, Repository } from "typeorm";
import { RemovePhotoHandler, UploadPhotoHandler } from "./handler";
import { InjectRepository } from "@nestjs/typeorm";
import { Photo } from "@/database/entities";

@Processor(PhotoEvent)
export class PhotoConsumer {
  constructor(
    private readonly logger: Logger,
    private readonly util: UntilService,
    private readonly upload: UploadService,
    private readonly dataSource: DataSource,
    @InjectRepository(Photo)
    private readonly photoService: Repository<Photo>,
  ) {}

  @Process(PhotoProcess.Upload)
  public async uploadPhotosToCloud(job: Job<UploadPhotoHandler>) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { files, productId } = job.data;

      const fileDecode: Express.Multer.File[] = [];

      for (const fileBase64 of files) {
        const convertFile = await this.util.convertBase64ToImage(fileBase64);
        fileDecode.push(convertFile);
      }

      const uploadPromises = fileDecode.map(async (file) => {
        const fileUpload = await this.upload.uploadImage(file);
        const newPhoto = this.photoService.create({
          url: fileUpload,
          productId: productId,
        });

        await queryRunner.manager.save(newPhoto);
      });

      await Promise.all(uploadPromises);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err);
      throw new BadRequestException(err);
    } finally {
      await queryRunner.release();
    }
  }

  @Process(PhotoProcess.Remove)
  public async removeImageToCloud(job: Job<RemovePhotoHandler>) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { files, productId } = job.data;

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
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err);
      throw new BadRequestException(err);
    } finally {
      await queryRunner.release();
    }
  }
}
