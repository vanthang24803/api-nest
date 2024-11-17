import { Logger, Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import * as entities from "@/database/entities";

@Module({
  imports: [TypeOrmModule.forFeature(Object.values(entities)), JwtModule],
  controllers: [ProductsController],
  providers: [ProductsService, Logger],
})
export class ProductsModule {}
