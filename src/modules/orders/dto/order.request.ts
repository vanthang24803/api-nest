import { EPayment } from "@/shared";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class OrderRequest {
  @IsUUID()
  id: string;

  @IsString()
  @MinLength(1)
  customer: string;

  @IsPhoneNumber()
  numberPhone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  address: string;

  @IsEnum(EPayment)
  payment: EPayment;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsBoolean()
  @IsOptional()
  isTransport?: boolean;

  @IsNumber()
  @Min(1)
  totalPrice: number;

  @ValidateNested({ each: true })
  @Type(() => OrderDetailDto)
  @IsArray()
  detail: OrderDetailDto[];
}

class OrderDetailDto {
  @IsUUID()
  optionId: string;

  @IsUUID()
  productId: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @MinLength(1)
  productName: string;

  @IsString()
  @MinLength(1)
  optionName: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(1)
  price: number;

  @IsNumber()
  @Min(0)
  sale: number;
}
