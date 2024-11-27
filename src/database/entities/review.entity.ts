import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CustomBaseEntity } from "./custom.entity";
import { Product } from "./product.entity";
import { User } from "./user.entity";

@Entity("reviews")
export class Review extends CustomBaseEntity {
  @Column({
    name: "content",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  content?: string;

  @Column({
    name: "star",
    type: "float",
    nullable: false,
    default: 0,
  })
  star: number;

  @Column({
    type: "uuid",
    nullable: false,
    name: "product_id",
  })
  productId!: string;

  @Column({
    type: "uuid",
    nullable: false,
    name: "user_id",
  })
  userId!: string;

  @ManyToOne(() => Product, (product) => product.reviews, {
    cascade: true,
  })
  @JoinColumn({
    name: "product_id",
  })
  product: Product;

  @ManyToOne(() => User, (user) => user.reviews, {
    cascade: true,
  })
  @JoinColumn({
    name: "user_id",
  })
  user: User;
}
