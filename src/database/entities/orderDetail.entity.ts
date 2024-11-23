import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Order } from "./order.entity";
import { Option } from "./options.entity";
import { CustomBaseEntity } from "./custom.entity";

@Entity("order_details")
export class OrderDetail extends CustomBaseEntity {
  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
    name: "product_name",
  })
  productName!: string;

  @Column({
    type: "text",
    nullable: true,
    name: "product_thumbnail",
  })
  thumbnail?: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
    name: "option_name",
  })
  optionName!: string;

  @Column({
    type: "bigint",
    nullable: false,
    default: 0,
    name: "option_quantity",
  })
  quantity: number;

  @Column({
    type: "int",
    nullable: false,
    default: 0,
    name: "option_sale",
  })
  sale: number;

  @Column({
    type: "double precision",
    nullable: false,
    name: "option_price",
  })
  price!: number;

  @Column({
    type: "uuid",
    nullable: false,
    name: "product_id",
  })
  productId: string;

  @Column({
    type: "uuid",
    nullable: false,
    name: "option_id",
  })
  optionId: string;

  @Column({
    type: "uuid",
    nullable: false,
    name: "order_id",
  })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.orderDetails, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "order_id",
  })
  order: Order;

  @ManyToOne(() => Option, (option) => option.orderDetails, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "option_id",
  })
  option: Option;
}
