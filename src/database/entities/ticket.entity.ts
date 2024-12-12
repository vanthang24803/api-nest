import { Column, Entity } from "typeorm";
import { CustomBaseEntity } from "./custom.entity";
import { ETicket } from "@/shared/enums/tikcet.enum";

@Entity("tickets")
export class Ticket extends CustomBaseEntity {
  @Column({
    name: "name",
    type: "varchar",
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: "code",
    type: "varchar",
    length: 10,
    nullable: false,
    unique: true,
  })
  code: string;

  @Column({
    name: "type",
    type: "enum",
    enum: ETicket,
    nullable: false,
  })
  type: ETicket;

  @Column({
    name: "quantity",
    type: "int",
    nullable: false,
    default: 0,
  })
  quantity: number;

  @Column({
    type: "bool",
    name: "is_expired",
    default: false,
  })
  idExpired: boolean;

  @Column({
    name: "start_at",
    type: "timestamp",
    nullable: false,
  })
  startAt: Date;

  @Column({
    name: "end_at",
    type: "timestamp",
    nullable: false,
  })
  endAt: Date;
}
