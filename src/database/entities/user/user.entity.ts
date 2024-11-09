import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { CustomBaseEntity } from "../custom.entity";
import { Roles } from "./role.entity";

@Entity("users")
export class Users extends CustomBaseEntity {
  @PrimaryGeneratedColumn("uuid", {
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

  @Column("text", {
    nullable: true,
    name: "avatar",
  })
  avatar?: string;

  @Column("varchar", {
    nullable: true,
    length: 255,
    name: "email",
  })
  email!: string;

  @ManyToMany(() => Roles, (roles) => roles.users)
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
  roles!: Roles[];
}
