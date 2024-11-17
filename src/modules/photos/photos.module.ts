import { Logger, Module } from "@nestjs/common";
import { PhotosController } from "./photos.controller";
import { PhotosService } from "./photos.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product, Photo } from "@/database/entities";

@Module({
  imports: [TypeOrmModule.forFeature([Product, Photo])],
  controllers: [PhotosController],
  providers: [PhotosService, Logger],
})
export class PhotosModule {}
