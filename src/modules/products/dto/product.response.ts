import { Exclude, Expose, Type } from "class-transformer";
import { IsArray, IsString, MaxLength, ValidateNested } from "class-validator";
import { CatalogResponse } from "@/modules/catalog/dto";
import { OptionResponse } from "@/modules/options/dto";
import { PhotoResponse } from "@/modules/photos/dto";

export class ProductResponse {
  @IsString()
  @MaxLength(256)
  name: string;

  @IsString()
  @MaxLength(256)
  brand: string;

  @IsString()
  thumbnail: string;

  @ValidateNested({ each: true })
  @Type(() => CatalogResponse)
  @IsArray()
  catalogs: CatalogResponse[];

  @ValidateNested({ each: true })
  @Type(() => OptionResponse)
  @IsArray()
  options: OptionResponse[];

  @ValidateNested({ each: true })
  @Type(() => PhotoResponse)
  @IsArray()
  photos: PhotoResponse[];

  @Exclude()
  specifications: string;

  @Exclude()
  introduction: string;

  @Expose()
  createdAt: Date;

  @Exclude()
  updatedAt?: string;
}
