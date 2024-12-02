import { Controller, Delete, Get, Post, UseGuards } from "@nestjs/common";
import { CartService } from "./cart.service";
import { JwtAuthGuard } from "@/common/guards";
import { CurrentUser } from "@/common/decorators";
import { User } from "@/database/entities";
import { CartRequest } from "./dto";
import { ApiTags } from "@nestjs/swagger";

@Controller("cart")
@ApiTags("Cart")
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  public async getCart(@CurrentUser() user: User) {
    return this.cartService.getCart(user);
  }

  @Post("add")
  public async addToCart(@CurrentUser() user: User, request: CartRequest) {
    return this.cartService.addToCart(user, request);
  }

  @Post("remove")
  public async removeToCart(@CurrentUser() user: User, request: CartRequest) {
    return this.cartService.removeOptionToCart(user, request);
  }

  @Delete("clear")
  public async clearCart(@CurrentUser() user: User) {
    return this.cartService.clearCart(user);
  }

  @Delete("items")
  public async removeItemCart(@CurrentUser() user: User, request: CartRequest) {
    return this.cartService.removeOptionToCart(user, request);
  }
}
