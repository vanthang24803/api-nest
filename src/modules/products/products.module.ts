import { Logger, Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import * as entities from "@/database/entities";
import { BullModule } from "@nestjs/bull";
import { ProductEvent } from "@/shared/events";
import { ProductConsumer } from "@/bull/consumers";

@Module({
  imports: [
    TypeOrmModule.forFeature(Object.values(entities)),
    JwtModule,
    BullModule.registerQueue({
      name: ProductEvent,
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, Logger, ProductConsumer],
})
export class ProductsModule {}
