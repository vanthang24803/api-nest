import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from "class-validator";

export class CartRequest {
  @IsUUID()
  productId: string;

  @IsString()
  @MinLength(1)
  productName: string;

  @IsOptional()
  thumbnail: string;

  @IsUUID()
  optionId: string;

  @IsString()
  @MinLength(1)
  optionName: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  sale: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}
