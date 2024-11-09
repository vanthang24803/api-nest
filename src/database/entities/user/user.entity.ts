import { Column, Entity, ManyToMany, PrimaryColumn } from "typeorm";
import { CustomBaseEntity } from "../custom.entity";
import { Roles } from "./role.entity";

@Entity("user")
export class Users extends CustomBaseEntity {
  @PrimaryColumn({
    type: "uuid",
    name: "id",
  })
  id!: string;

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

  @Column("varchar", {
    nullable: true,
    length: 255,
    name: "email",
  })
  email!: string;

  @ManyToMany(() => Roles, (roles) => roles.id)
  roles!: Roles[];
}
