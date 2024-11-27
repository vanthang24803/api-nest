import { UntilService } from "@/common";
import { Cart, User, CartDetail } from "@/database/entities";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CartRequest, CartResponse } from "./dto";
import { NormalResponse } from "@/shared";
import { plainToInstance } from "class-transformer";
import { RedisService } from "@/redis/redis.service";

@Injectable()
export class CartService {
  constructor(
    private readonly logger: Logger,
    private readonly redis: RedisService,
    private readonly util: UntilService,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartDetail)
    private readonly cartDetailRepository: Repository<CartDetail>,
  ) {}

  public async getCart(user: User) {
    const cacheKey = `Cart_${user.id}`;

    const cache = await this.redis.get<NormalResponse>(cacheKey);

    if (cache) return cache;

    const cart = await this.cartRepository.findOne({
      where: {
        userId: user.id,
      },
      relations: {
        cartDetails: true,
      },
    });

    if (!cart) {
      await this.cartRepository.save({
        id: user.id,
        userId: user.id,
      });
    }

    const response: CartResponse[] = cart.cartDetails.map((value) =>
      plainToInstance(CartResponse, value),
    );

    const result = this.util.buildSuccessResponse(response);

    await this.redis.set(cacheKey, response);

    return result;
  }

  public async addToCart(
    user: User,
    request: CartRequest,
  ): Promise<NormalResponse> {
    const { optionId, quantity } = request;

    const existingItem = await this.cartDetailRepository.findOne({
      where: {
        optionId: request.optionId,
        cart: {
          userId: user.id,
        },
      },
    });

    if (existingItem) {
      await this.cartDetailRepository.update(existingItem.id, {
        quantity: (existingItem.quantity += 1),
      });
    } else {
      await this.cartDetailRepository.save({
        optionId,
        quantity,
        cart: {
          userId: user.id,
        },
      });
    }

    return this.util.buildSuccessResponse({
      message: "Add To Cart Successfully!",
    });
  }

  public async clearCart(user: User) {
    const cartDetails = await this.cartDetailRepository.find({
      where: {
        cart: {
          userId: user.id,
        },
      },
    });

    if (cartDetails.length !== 0) {
      await this.cartDetailRepository.remove(cartDetails);
    }

    return this.util.buildSuccessResponse({
      message: "Cleared all cart details successfully!",
    });
  }

  public async removeToCart(user: User, request: CartRequest) {
    const existingItem = await this.cartDetailRepository.findOne({
      where: {
        optionId: request.optionId,
        cart: {
          userId: user.id,
        },
      },
    });

    if (!existingItem) throw new NotFoundException("Cart item not found!");

    existingItem.quantity -= 1;

    if (existingItem.quantity <= 0) {
      await this.cartDetailRepository.remove(existingItem);
    } else {
      await this.cartDetailRepository.save(existingItem);
    }

    return this.util.buildSuccessResponse("Deleted cart success!");
  }

  public async removeOptionToCart(user: User, request: CartRequest) {
    const existingItem = await this.cartDetailRepository.findOne({
      where: {
        optionId: request.optionId,
        cart: {
          userId: user.id,
        },
      },
    });

    if (!existingItem) throw new NotFoundException("Cart item not found!");

    await this.cartDetailRepository.remove(existingItem);

    return this.util.buildSuccessResponse("Deleted cart success!");
  }
}
