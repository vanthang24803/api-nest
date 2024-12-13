import { ETicket } from "@/shared/enums/tikcet.enum";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class TicketRequest {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(10)
  code: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  discount: number;

  @IsEnum(ETicket)
  type: ETicket;

  @IsDateString()
  startAt: Date;

  @IsDateString()
  endAt: Date;
}
