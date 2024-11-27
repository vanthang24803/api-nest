import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { CartDetail } from "./cartDetail.entity";

@Entity("carts")
export class Cart extends BaseEntity {
  @PrimaryGeneratedColumn("uuid", {
    name: "id",
  })
  id!: string;

  @OneToMany(() => CartDetail, (cartDetail) => cartDetail.cart, {
    onDelete: "CASCADE",
  })
  cartDetails: CartDetail[];

  @Column({
    type: "uuid",
    nullable: false,
    name: "user_id",
  })
  userId!: string;

  @OneToOne(() => User, (user) => user.cart, {
    cascade: true,
  })
  @JoinColumn({
    name: "user_id",
  })
  user: User;
}
