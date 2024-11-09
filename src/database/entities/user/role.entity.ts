import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { CustomBaseEntity } from "../custom.entity";
import { Role } from "@/shared/enums";
import { Users } from "./user.entity";

@Entity("roles")
export class Roles extends CustomBaseEntity {
  @PrimaryGeneratedColumn("uuid", {
    name: "id",
  })
  id!: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.Customer,
    name: "role",
  })
  role!: Role;

  @ManyToMany(() => Users, (user) => user.roles)
  users!: Users[];
}
