import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { CustomBaseEntity } from "../custom.entity";
import { Catalog } from "../catalog";

@Entity("products")
export class Product extends CustomBaseEntity {
  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
  })
  name!: string;

  @Column({
    type: "text",
    nullable: false,
  })
  thumbnail!: string;

  @Column({
    type: "bigint",
    nullable: false,
    default: 0,
  })
  sold: number;

  @Column({
    type: "text",
    nullable: true,
  })
  introduction?: string;

  @Column({
    type: "text",
    nullable: true,
  })
  specifications?: string;

  @ManyToMany(() => Catalog, (catalog) => catalog.products)
  @JoinTable({
    name: "products_catalogs",
    joinColumn: {
      name: "product_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "catalog_id",
      referencedColumnName: "id",
    },
  })
  catalogs: Catalog[];
}
