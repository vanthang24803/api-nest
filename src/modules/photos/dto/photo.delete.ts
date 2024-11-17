import { IsEmpty, IsUUID } from "class-validator";

export class PhotoDelete {
  @IsUUID()
  @IsEmpty()
  id: string;
}
