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
import { AuthorResponse, CreateReviewRequest, ReviewResponse } from "./dto";
import { NormalResponse, ReviewQuery } from "@/shared";
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

  public async findAllReviewForProduct(productId: string, query: ReviewQuery) {
    const existingProduct = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!existingProduct) {
      throw new NotFoundException("Product not found!");
    }

    const { star, limit = 10, page = 1, status } = query;

    let allReviews = await this.reviewRepository.find({
      where: { productId: existingProduct.id },
      relations: ["photos", "user"],
    });

    if (status) {
      allReviews = this.filterReviewsByStatus(allReviews, status);
    }

    if (star && !isNaN(Number(star))) {
      const starValue = Number(star);
      allReviews = this.filterReviewsByStar(allReviews, starValue);
    }

    const totalItems = allReviews.length;
    const totalPage = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const paginatedReviews = this.paginateReviews(allReviews, skip, limit);

    const averageStar =
      totalItems > 0
        ? allReviews.reduce((sum, review) => sum + review.star, 0) / totalItems
        : 0;

    return {
      averageStar,
      currentPage: page,
      totalPage,
      items: paginatedReviews.length,
      totalItems,
      result: paginatedReviews,
    };
  }

  public async findOne(reviewId: string) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ["photos", "user"],
    });

    if (!review) throw new NotFoundException("Review not found!");

    return this.mapToReviewResponse(review);
  }

  public async remove(reviewId: string) {
    const review = await this.reviewRepository.findOne({
      where: {
        id: reviewId,
      },
    });

    if (!review) throw new NotFoundException("Review not found!");

    await this.reviewRepository.softDelete(review.id);

    return this.util.buildSuccessResponse("Deleted review successfully!");
  }

  private filterReviewsByStatus(reviews: Review[], status: string): Review[] {
    switch (status) {
      case "Lasted":
        return reviews.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
      case "Image":
        return reviews.filter((review) => review.photos.length > 0);
      default:
        return reviews;
    }
  }

  private filterReviewsByStar(reviews: Review[], starValue: number): Review[] {
    const tolerance = 0.0001;
    return reviews.filter(
      (review) => Math.abs(review.star - starValue) < tolerance,
    );
  }

  private paginateReviews(
    reviews: Review[],
    skip: number,
    limit: number,
  ): ReviewResponse[] {
    return reviews
      .slice(skip, skip + limit)
      .map((review) => this.mapToReviewResponse(review));
  }

  private mapToReviewResponse(review: Review): ReviewResponse {
    return {
      id: review.id,
      star: review.star,
      content: review.content,
      author: {
        id: review.user.id,
        fullName: `${review.user.firstName} ${review.user.lastName}`,
        firstName: review.user.firstName,
        lastName: review.user.lastName,
        avatar: review.user.avatar,
      } as AuthorResponse,
      photos: review.photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        createdAt: photo.createdAt,
      })),
      createdAt: review.createdAt,
    };
  }
}
