import { Logger, Module } from "@nestjs/common";
import { PhotosController } from "./photos.controller";
import { PhotosService } from "./photos.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product, Photo } from "@/database/entities";
import { BullModule } from "@nestjs/bull";
import { PhotoEvent } from "@/shared/events";
import { PhotoConsumer } from "@/bull/consumers";

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Photo]),
    BullModule.registerQueueAsync({
      name: PhotoEvent,
    }),
  ],
  controllers: [PhotosController],
  providers: [PhotosService, Logger, PhotoConsumer],
})
export class PhotosModule {}
