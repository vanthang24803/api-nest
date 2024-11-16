import { OptionRequest } from "@/modules/options/dto";
import { Type } from "class-transformer";
import {
  IsArray,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator";

export class ProductRequest {
  @IsString()
  @MaxLength(128)
  name: string;

  introduction?: string;
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
