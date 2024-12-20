import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { CustomBaseEntity } from "./custom.entity";
import { User } from "./user.entity";
import { OrderStatus } from "./orderStatus.entity";
import { OrderDetail } from "./orderDetail.entity";
import { EPayment } from "@/shared";

@Entity("orders")
export class Order extends CustomBaseEntity {
  @Column({
    type: "varchar",
    name: "email",
    nullable: false,
    length: 255,
  })
  email: string;

  @Column({
    type: "varchar",
    nullable: false,
    length: 255,
  })
  customer: string;

  @Column({
    type: "enum",
    enum: EPayment,
    nullable: false,
    default: EPayment.COD,
  })
  payment: EPayment;

  @Column({
    type: "varchar",
    nullable: false,
    length: 12,
  })
  numberPhone: string;

  @Column({
    type: "text",
    nullable: false,
  })
  address: string;

  @Column({
    type: "bool",
    nullable: false,
    name: "transport",
    default: false,
  })
  isTransport: boolean;

  @Column({
    type: "bool",
    nullable: false,
    name: "reviewed",
    default: false,
  })
  isReviewed: boolean;

  @Column({
    type: "bigint",
    default: 0,
  })
  quantity: number;

  @Column({
    type: "double precision",
    default: 0,
    name: "total_price",
  })
  totalPrice: number;

  @Column({
    type: "uuid",
    nullable: false,
    name: "user_id",
  })
  userId: string;

  @ManyToOne(() => User, (user) => user.orders, {
    cascade: true,
  })
  @JoinColumn({
    name: "user_id",
  })
  user: User;

  @OneToMany(() => OrderStatus, (status) => status.order, {
    onDelete: "CASCADE",
  })
  status: OrderStatus[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.option, {
    onDelete: "CASCADE",
  })
  orderDetails: OrderDetail[];
}
