import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { ApiTags } from "@nestjs/swagger";
import { ReviewQuery, Role } from "@/shared";
import { JwtAuthGuard, RolesGuard } from "@/common/guards";
import { CurrentUser, Roles } from "@/common/decorators";
import { User } from "@/database/entities";
import { CreateReviewRequest } from "./dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";

@Controller("reviews")
@ApiTags("Review")
export class ReviewsController {
  constructor(private readonly reviewService: ReviewsService) {}

  @Get("product/:productId")
  public async findAllReviewForProduct(
    @Param("productId") productId: string,
    @Query() query: ReviewQuery,
  ) {
    return this.reviewService.findAllReviewForProduct(productId, query);
  }

  @Get(":reviewId")
  public async findOneReview(@Param("reviewId") reviewId: string) {
    return this.findOneReview(reviewId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: "photos",
        maxCount: 5,
      },
    ]),
  )
  public async create(
    @CurrentUser() user: User,
    @Body() req: CreateReviewRequest,
    @UploadedFiles()
    files: {
      photos?: Express.Multer.File[];
    },
  ) {
    return this.reviewService.save(user, req, files.photos);
  }

  @Delete(":reviewId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Customer)
  public async remove(@Param("reviewId") reviewId: string) {
    return this.reviewService.remove(reviewId);
  }
}
