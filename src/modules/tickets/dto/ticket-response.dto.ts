import { Exclude, Expose } from "class-transformer";

export class TicketResponse {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  quantity: number;

  @Expose()
  discount: number;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;

  @Exclude()
  deletedAt?: string;
}
