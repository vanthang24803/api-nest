import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CustomBaseEntity } from "./custom.entity";
import { EOrderStatus } from "@/shared";
import { Order } from "./order.entity";

@Entity("order_status")
export class OrderStatus extends CustomBaseEntity {
  @Column({
    type: "enum",
    nullable: false,
    enum: EOrderStatus,
    default: EOrderStatus.PENDING,
  })
  status: EOrderStatus;

  @Column({
    type: "uuid",
    nullable: false,
    name: "order_id",
  })
  orderId!: string;

  @ManyToOne(() => Order, (order) => order.status, {
    cascade: true,
  })
  @JoinColumn({
    name: "order_id",
  })
  order: Order;
}
