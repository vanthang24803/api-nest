import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { CustomBaseEntity } from "../custom.entity";
import { Role as RoleEnum } from "@/shared/enums";
import { User } from "./user.entity";

@Entity("roles")
export class Role extends CustomBaseEntity {
  @PrimaryGeneratedColumn("uuid", {
    name: "id",
  })
  id!: string;

  @Column({
    type: "enum",
    enum: RoleEnum,
    default: RoleEnum.Customer,
    name: "role",
  })
  role!: RoleEnum;

  @ManyToMany(() => User, (user) => user.roles)
  User!: User[];
}
