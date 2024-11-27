import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
} from "typeorm";
import { CustomBaseEntity } from "./custom.entity";
import { Role } from "./role.entity";
import { Token } from "./token.entity";
import { Order } from "./order.entity";
import { Review } from "./review.entity";
import { Cart } from "./cart.entity";

@Entity("users")
export class User extends CustomBaseEntity {
  @Column("varchar", {
    nullable: false,
    length: 255,
    name: "first_name",
  })
  firstName!: string;

  @Column("varchar", {
    nullable: false,
    length: 255,
    name: "last_name",
  })
  lastName!: string;

  @Column("text", {
    nullable: false,
    name: "password",
  })
  password!: string;

  @Column("text", {
    nullable: true,
    name: "avatar",
  })
  avatar?: string;

  @Column({
    type: "bool",
    name: "email_confirm",
    default: false,
    nullable: false,
  })
  isEmailConfirm: boolean;

  @Column("varchar", {
    nullable: true,
    length: 255,
    name: "email",
  })
  email!: string;

  @OneToMany(() => Token, (token) => token.user, {
    onDelete: "CASCADE",
  })
  tokens: Token[];

  @OneToMany(() => Order, (order) => order.user, {
    onDelete: "CASCADE",
  })
  orders: Order[];

  @OneToMany(() => Review, (review) => review.user, {
    onDelete: "CASCADE",
  })
  reviews: Review[];

  @OneToOne(() => Cart, (cart) => cart.user, {
    onDelete: "CASCADE",
  })
  cart: Cart;

  @ManyToMany(() => Role, (role) => role.User)
  @JoinTable({
    name: "users_roles",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "role_id",
      referencedColumnName: "id",
    },
  })
  roles!: Role[];
}
