import { Column, Entity, ManyToOne } from "typeorm";
import { CustomBaseEntity } from "./custom.entity";
import { Product } from "./product.entity";

@Entity("photos")
export class Photo extends CustomBaseEntity {
  @Column({
    type: "text",
    nullable: false,
  })
  url: string;

  @Column({
    type: "uuid",
    nullable: false,
  })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.photos, {
    cascade: true,
  })
  product: Product;
}
