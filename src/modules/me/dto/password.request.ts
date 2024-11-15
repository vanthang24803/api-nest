import { IsStrongPassword, Length } from "class-validator";

export class UpdatePasswordRequest {
  @IsStrongPassword()
  @Length(6)
  oldPassword: string;

  @IsStrongPassword()
  @Length(6)
  newPassword: string;
}
