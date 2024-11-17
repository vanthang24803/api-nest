import { Exclude, Expose } from "class-transformer";

export class OptionResponse {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  sale: number;

  @Expose()
  price: number;

  @Expose()
  quantity: number;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Exclude()
  productId: string;
}
