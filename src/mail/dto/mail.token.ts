import { IsEmail, IsString, IsUUID, IsEnum, MinLength } from "class-validator";
import { EEmailType } from "@/shared/enums";

export class MailWithTokenEvent {
  @IsEmail()
  @MinLength(1, { message: "Email cannot be empty" })
  toEmail: string;

  @IsString()
  @MinLength(1, { message: "Full name cannot be empty" })
  fullName: string;

  @IsUUID()
  userId: string;

  @IsString()
  @MinLength(1, { message: "Token cannot be empty" })
  token: string;

  @IsEnum(EEmailType)
  type: EEmailType;
}
