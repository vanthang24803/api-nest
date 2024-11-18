import { Entity, Column, ManyToMany } from "typeorm";
import { CustomBaseEntity } from "./custom.entity";
import { Product } from "./product.entity";

@Entity("catalogs")
export class Catalog extends CustomBaseEntity {
  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
  })
  name!: string;

  @ManyToMany(() => Product, (product) => product.catalogs)
  products: Product[];
}
