import { IsEmail, IsPhoneNumber, IsString, MinLength } from "class-validator";

export class UserUpdateOrder {
  @IsString()
  @MinLength(1)
  customer: string;

  @IsPhoneNumber()
  numberPhone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  address: string;
}
