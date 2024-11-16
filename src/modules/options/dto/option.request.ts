import { IsBoolean, IsNumber, IsString, MaxLength, Min } from "class-validator";

export class OptionRequest {
  @IsString()
  @MaxLength(128)
  name!: string;

  @IsNumber()
  @Min(0)
  sale: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsBoolean()
  isActive?: boolean;
}
