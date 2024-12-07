import { Exclude, Expose } from "class-transformer";

export class PhotoResponse {
  @Expose()
  id: string;

  @Expose()
  url: string;

  @Expose()
  createdAt: Date;

  @Exclude()
  productId?: string;
}
