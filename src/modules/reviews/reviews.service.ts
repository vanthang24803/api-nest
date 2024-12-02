import { v4 as uuidv4 } from "uuid";
import { UntilService, UploadService } from "@/common";
import {
  Order,
  OrderDetail,
  Product,
  Review,
  ReviewPhoto,
  User,
} from "@/database/entities";
import { RedisService } from "@/redis/redis.service";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { CreateReviewRequest } from "./dto";
import { NormalResponse } from "@/shared";

@Injectable()
export class ReviewsService {
  constructor(
    private readonly logger: Logger,
    private readonly util: UntilService,
    private readonly upload: UploadService,
    private readonly redis: RedisService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(ReviewPhoto)
    private readonly reviewPhotoRepository: Repository<ReviewPhoto>,
    private readonly dataSource: DataSource,
  ) {}

  public async save(
    user: User,
    request: CreateReviewRequest,
    files: Express.Multer.File[],
  ): Promise<NormalResponse> {
    const existingOrder = await this.dataSource.getRepository(Order).findOne({
      where: {
        id: request.orderId,
        isReviewed: false,
        userId: user.id,
      },
    });

    if (!existingOrder) {
      throw new NotFoundException("Order not found!");
    }

    const orderDetails = await this.dataSource.getRepository(OrderDetail).find({
      where: { orderId: existingOrder.id },
      select: { productId: true },
    });

    const productIds = orderDetails.map((detail) => detail.productId);

    const products = await this.dataSource.getRepository(Product).findBy({
      id: In(productIds),
    });

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    await this.dataSource.transaction(async (manager) => {
      try {
        const reviews = productIds.map((productId) => {
          const product = productMap.get(productId);

          if (!product) {
            throw new BadRequestException(
              `Product with ID ${productId} not found!`,
            );
          }

          return manager.create(Review, {
            id: uuidv4(),
            productId: product.id,
            ...request,
            userId: user.id,
          });
        });

        const savedReviews = await manager.save(Review, reviews);

        const photos = await Promise.all(
          files.map(async (file) => {
            const uploadUrl = await this.upload.uploadImage(file);

            const reviewId = savedReviews[0].id;

            return manager.create(ReviewPhoto, {
              url: uploadUrl,
              reviewId,
            });
          }),
        );

        await manager.save(ReviewPhoto, photos);

        await manager.update(Order, request.orderId, { isReviewed: true });
      } catch (err) {
        this.logger.error(err);
        throw new BadRequestException(err);
      }
    });

    return this.util.buildCreatedResponse("Created review successfully!");
  }
}
