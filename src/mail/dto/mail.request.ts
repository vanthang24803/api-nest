import { IsEmail, IsEmpty, IsString } from "class-validator";

export class MailRequest {
  @IsEmail()
  @IsEmpty()
  toEmail: string;

  @IsString()
  @IsEmpty()
  subject: string;

  @IsString()
  @IsEmpty()
  message: string;
}
