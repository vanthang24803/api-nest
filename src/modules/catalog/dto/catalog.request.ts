import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class CatalogRequest {
  @ApiProperty({
    example: "Laptop",
    description: "The catalog name of the app",
  })
  @IsString()
  @MinLength(1, {
    message: "Catalog name must be at least 2 characters long.",
  })
  @MaxLength(255, {
    message: "Catalog name cannot exceed 256 characters.",
  })
  name: string;
}
