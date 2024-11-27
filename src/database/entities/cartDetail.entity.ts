import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Cart } from "./cart.entity";
import { Option } from "./options.entity";

@Entity("cart_details")
export class CartDetail extends BaseEntity {
  @PrimaryGeneratedColumn("uuid", {
    name: "id",
  })
  id!: string;

  @Column({
    type: "bigint",
    default: 0,
    nullable: false,
  })
  quantity: number;

  @Column({
    type: "uuid",
    nullable: false,
    name: "cart_id",
  })
  cartId!: string;

  @Column({
    type: "uuid",
    nullable: false,
    name: "option_id",
  })
  optionId!: string;

  @ManyToOne(() => Cart, (cart) => cart.cartDetails, { cascade: true })
  @JoinColumn({
    name: "cart_id",
  })
  cart: Cart;

  @ManyToOne(() => Option, (option) => option.carts, { cascade: true })
  @JoinColumn({
    name: "option_id",
  })
  option: Option;
}
