import { IsString, MaxLength } from "class-validator";

export class ProfileRequest {
  @IsString()
  @MaxLength(255)
  firstName: string;

  @IsString()
  @MaxLength(255)
  lastName: string;

  @IsString()
  @MaxLength(255)
  email: string;
}
