import { JwtAuthGuard } from "@/common/guards";
import { Controller, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}
}
