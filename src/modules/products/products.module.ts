import { Logger, Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { CommonModule } from "@/common/common.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import * as entities from "@/database/entities";
import { AuthenticationService } from "@/common";
import { JwtStrategy } from "@/common/strategies";

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature(Object.values(entities)),
    JwtModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, AuthenticationService, JwtStrategy, Logger],
})
export class ProductsModule {}
