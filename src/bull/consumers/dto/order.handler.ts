import { Order } from "@/database/entities";

export type SendOrderMailHandler = {
  subject: string;
  message: Order;
};
