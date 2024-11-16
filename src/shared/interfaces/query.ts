import { Transform } from "class-transformer";
import { IsOptional, IsNumber, Min } from "class-validator";

export abstract class BaseQuery {
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 20))
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  constructor(page: number = 1, limit: number = 20) {
    this.page = page;
    this.limit = limit;
  }
}
