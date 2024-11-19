import { Logger, Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as entities from "@/database/entities";
import { BullModule } from "@nestjs/bull";
import { OrderEvent } from "@/shared/events";
import { OrderConsumer } from "@/bull/consumers";

@Module({
  imports: [
    TypeOrmModule.forFeature(Object.values(entities)),
    BullModule.registerQueue({
      name: OrderEvent,
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, Logger, OrderConsumer],
})
export class OrdersModule {}
