import { Logger, Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product, User, Option } from "@/database/entities";

@Module({
  imports: [TypeOrmModule.forFeature([Product, Option, User])],
  controllers: [OrdersController],
  providers: [OrdersService, Logger],
})
export class OrdersModule {}
