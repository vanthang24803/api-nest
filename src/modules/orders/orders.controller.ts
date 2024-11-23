import { JwtAuthGuard, RolesGuard } from "@/common/guards";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrderRequest, UserUpdateOrder } from "./dto";
import { BaseQuery, EOrderStatus, NormalResponse, Role } from "@/shared";
import { CurrentUser, Roles } from "@/common/decorators";
import { User } from "@/database/entities";
import { ApiTags } from "@nestjs/swagger";

@Controller("orders")
@ApiTags("Orders")
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Customer)
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

  @Get(":id")
  public async findOne(@Param("id") id: string) {
    return this.orderService.findOneOrder(id);
  }

  @Get("manager")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin)
  public async findAllOrderForManager(@Query() query: BaseQuery) {
    return this.orderService.findAllOrdersForManager(query);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  public async updateOrderByUser(
    @CurrentUser() user: User,
    @Param("id") orderId: string,
    @Body() request: UserUpdateOrder,
  ) {
    return this.orderService.updateByUser(user, orderId, request);
  }

  @Put(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin)
  public async updateStatusOrder(
    @Param("id") orderId: string,
    @Body("status") status: EOrderStatus,
  ) {
    return this.orderService.updateStatusOrderByManager(orderId, status);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  public async removeOrder(
    @CurrentUser() user: User,
    @Param("id") orderId: string,
  ) {
    return this.orderService.removeOrderByUser(user, orderId);
  }
}
