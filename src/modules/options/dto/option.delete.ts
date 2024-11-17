import { IsEmpty, IsUUID } from "class-validator";

export class OptionDelete {
  @IsUUID()
  @IsEmpty()
  id: string;
}
