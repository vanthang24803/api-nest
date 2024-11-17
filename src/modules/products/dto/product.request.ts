import { OptionRequest } from "@/modules/options/dto";
import { Type } from "class-transformer";
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator";

export class ProductRequest {
  @IsString()
  @MaxLength(256)
  name: string;

  @IsString()
  @MaxLength(256)
  brand: string;

  @IsOptional()
  @IsString()
  introduction?: string;

  @IsOptional()
  @IsString()
  specifications?: string;

  @ValidateNested({ each: true })
  @Type(() => CatalogDto)
  @IsArray()
  catalogs: CatalogDto[];

  @ValidateNested({ each: true })
  @Type(() => OptionRequest)
  @IsArray()
  options: OptionRequest[];
}

class CatalogDto {
  @IsUUID()
  id: string;
}
