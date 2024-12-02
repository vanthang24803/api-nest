import { Expose } from "class-transformer";

export class CartResponse {
  @Expose()
  id: string;

  @Expose()
  productId: string;

  @Expose()
  productName: string;

  @Expose()
  thumbnail: string;

  @Expose()
  optionId: string;

  @Expose()
  optionName: string;

  @Expose()
  sale: number;

  @Expose()
  quantity: number;

  @Expose()
  price: number;
}
