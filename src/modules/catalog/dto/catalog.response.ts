import { Expose } from "class-transformer";

export class CatalogResponse {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date;
}
