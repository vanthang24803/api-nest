import { NormalResponse, Role } from "@/shared";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CatalogService } from "./catalog.service";
import { CatalogRequest } from "./dto";
import { JwtAuthGuard, RolesGuard } from "@/common/guards";
import { Roles } from "@/common/decorators";

@Controller("catalogs")
@ApiTags("Catalog")
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  public async findAll(): Promise<NormalResponse> {
    return await this.catalogService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  public async save(@Body() request: CatalogRequest): Promise<NormalResponse> {
    return await this.catalogService.save(request);
  }

  @Get(":id")
  public async findOne(@Param("id") id: string): Promise<NormalResponse> {
    return await this.catalogService.findOneById(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  public async update(
    @Param("id") id: string,
    @Body() request: CatalogRequest,
  ): Promise<NormalResponse> {
    return await this.catalogService.update(id, request);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  public async remove(@Param("id") id: string): Promise<NormalResponse> {
    return await this.catalogService.remove(id);
  }
}
