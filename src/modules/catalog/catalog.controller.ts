import { NormalResponse } from "@/shared";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CatalogService } from "./catalog.service";
import { CatalogRequest } from "./dto";

@Controller("catalog")
@ApiTags("Catalog")
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  public async findAll(): Promise<NormalResponse> {
    return await this.catalogService.findAll();
  }

  @Post()
  public async save(@Body() request: CatalogRequest): Promise<NormalResponse> {
    return await this.catalogService.save(request);
  }

  @Get(":id")
  public async findOne(@Param("id") id: string): Promise<NormalResponse> {
    return await this.catalogService.findOneById(id);
  }

  @Put(":id")
  public async update(
    @Param("id") id: string,
    @Body() request: CatalogRequest,
  ): Promise<NormalResponse> {
    return await this.catalogService.update(id, request);
  }

  @Delete(":id")
  public async remove(@Param("id") id: string): Promise<NormalResponse> {
    return await this.catalogService.remove(id);
  }
}
