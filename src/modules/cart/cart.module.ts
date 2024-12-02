import { Logger, Module } from "@nestjs/common";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cart, CartDetail } from "@/database/entities";

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartDetail])],
  controllers: [CartController],
  providers: [CartService, Logger],
})
export class CartModule {}
