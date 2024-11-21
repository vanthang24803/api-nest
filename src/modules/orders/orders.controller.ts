import { JwtAuthGuard } from "@/common/guards";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrderRequest } from "./dto";
import { NormalResponse } from "@/shared";
import { CurrentUser } from "@/common/decorators";
import { User } from "@/database/entities";

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post()
  public async save(
    @CurrentUser() user: User,
    @Body() request: OrderRequest,
  ): Promise<NormalResponse> {
    return this.orderService.save(user, request);
  }
}
