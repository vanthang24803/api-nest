import { IsString, MaxLength } from "class-validator";

export class UpdateProductRequest {
  @IsString()
  @MaxLength(128)
  name: string;

  introduction?: string;
  specifications?: string;
}
