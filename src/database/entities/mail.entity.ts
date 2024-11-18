import { Column, Entity } from "typeorm";
import { CustomBaseEntity } from "./custom.entity";
import { EEmailType } from "@/shared";

@Entity("templates")
export class Mail extends CustomBaseEntity {
  @Column({
    name: "type",
    enum: EEmailType,
  })
  type: EEmailType;

  @Column({
    name: "template",
    nullable: false,
    type: "text",
  })
  template: string;
}
