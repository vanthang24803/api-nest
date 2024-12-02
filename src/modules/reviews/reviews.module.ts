import { Logger, Module } from "@nestjs/common";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  Order,
  OrderDetail,
  Product,
  Review,
  ReviewPhoto,
} from "@/database/entities";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      Product,
      Order,
      ReviewPhoto,
      OrderDetail,
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, Logger],
})
export class ReviewsModule {}
