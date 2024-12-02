import {
  IsNumber,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateReviewRequest {
  @IsNumber()
  @Min(1)
  @Max(5)
  star: number;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  content: string;

  @IsUUID()
  orderId: string;
}
