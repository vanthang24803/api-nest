import { EOrderStatus, EPayment } from "@/shared";
import { Exclude, Expose, Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";

export class OrderResponse {
  @Expose()
  id: string;

  @Expose()
  customer: string;

  @Expose()
  numberPhone: string;

  @Expose()
  email: string;

  @Expose()
  address: string;

  @Expose()
  payment: EPayment;

  @Expose()
  quantity: number;

  @Expose()
  isTransport?: boolean;

  @Expose()
  isReview: boolean;

  @Expose()
  totalPrice: number;

  @ValidateNested({ each: true })
  @Type(() => OrderStatusResponse)
  @IsArray()
  status: OrderStatusResponse[];

  @ValidateNested({ each: true })
  @Type(() => OrderDetailResponse)
  @IsArray()
  orderDetails: OrderDetailResponse[];

  @Exclude()
  deletedAt: Date;
}

class OrderStatusResponse {
  @Expose()
  id: string;

  @Expose()
  status: EOrderStatus;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  orderId: string;

  @Exclude()
  deletedAt: Date;
}

class OrderDetailResponse {
  @Expose()
  optionId: string;

  @Expose()
  productId: string;

  @Expose()
  thumbnail?: string;

  @Expose()
  productName: string;

  @Expose()
  optionName: string;

  @Expose()
  quantity: number;

  @Expose()
  price: number;

  @Expose()
  sale: number;

  @Exclude()
  orderId: string;

  @Exclude()
  deletedAt: Date;
}
