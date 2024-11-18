import { Entity, Column, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { CustomBaseEntity } from "./custom.entity";
import { Role } from "./role.entity";
import { Token } from "./token.entity";

@Entity("users")
export class User extends CustomBaseEntity {
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

  @Column({
    type: "bool",
    name: "email_confirm",
    default: false,
    nullable: false,
  })
  isEmailConfirm: boolean;

  @Column("varchar", {
    nullable: true,
    length: 255,
    name: "email",
  })
  email!: string;

  @OneToMany(() => Token, (token) => token.user, { cascade: true })
  tokens: Token[];

  @ManyToMany(() => Role, (role) => role.User)
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
  roles!: Role[];
}
