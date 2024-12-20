import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { CustomBaseEntity } from "./custom.entity";
import { Product } from "./product.entity";
import { EPayment } from "@/shared";
import { OrderDetail } from "./orderDetail.entity";
import { CartDetail } from "./cartDetail.entity";

@Entity("options")
export class Option extends CustomBaseEntity {
  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
  })
  name!: string;

  @Column({
    type: "bigint",
    nullable: false,
    default: 0,
  })
  sale: number;

  @Column({
    type: "bigint",
    nullable: false,
    default: 0,
  })
  quantity: number;

  @Column({
    type: "enum",
    nullable: false,
    enum: EPayment,
    default: EPayment.COD,
  })
  payment: EPayment;

  @Column({
    type: "double precision",
    nullable: false,
    default: 0,
  })
  price: number;

  @Column({
    type: "boolean",
    nullable: false,
    default: false,
    name: "is_active",
  })
  isActive: boolean;

  @Column({
    type: "uuid",
    nullable: false,
  })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.options, {
    cascade: true,
  })
  product: Product;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.option, {
    onDelete: "CASCADE",
  })
  orderDetails: OrderDetail[];

  @OneToMany(() => CartDetail, (cartDetail) => cartDetail.option, {
    onDelete: "CASCADE",
  })
  carts: CartDetail[];
}
