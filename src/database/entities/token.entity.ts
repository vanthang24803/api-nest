import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { CustomBaseEntity } from "./custom.entity";
import { User } from "./user.entity";

@Entity("tokens")
export class Token extends CustomBaseEntity {
  @Column({
    type: "varchar",
    nullable: false,
  })
  name!: string;

  @Column({
    type: "text",
    nullable: false,
  })
  value!: string;

  @Column({
    name: "user_id",
    type: "uuid",
    nullable: false,
  })
  userId!: string;

  @ManyToOne(() => User, (user) => user.tokens)
  @JoinColumn({ name: "user_id" })
  user!: User;
}
