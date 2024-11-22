import { JwtAuthGuard } from "@/common/guards";
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrderRequest } from "./dto";
import { BaseQuery, NormalResponse, Role } from "@/shared";
import { CurrentUser, Roles } from "@/common/decorators";
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

  @Get()
  public async findAll(@CurrentUser() user: User, @Query() query: BaseQuery) {
    return this.orderService.findAllOrdersForUser(user, query);
  }

  @Get("manager")
  @Roles(Role.Manager, Role.Admin)
  public async findAllOrderForManager(@Query() query: BaseQuery) {
    return this.orderService.findAllOrdersForManager(query);
  }
}
