import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { CustomBaseEntity } from "../custom.entity";

@Entity("catalogs")
export class Catalog extends CustomBaseEntity {
  @PrimaryGeneratedColumn("uuid", {
    name: "id",
  })
  id!: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
  })
  name!: string;
}
