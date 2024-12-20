import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { OptionsService } from "./options.service";
import { BaseQuery, NormalResponse, Role } from "@/shared";
import { OptionDelete, OptionRequest } from "./dto";
import { JwtAuthGuard, RolesGuard } from "@/common/guards";
import { Roles } from "@/common/decorators";

@Controller("products/:productId/options")
@ApiTags("Options")
export class OptionsController {
  constructor(private readonly optionService: OptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Manager)
  public async save(
    @Param("productId") productId: string,
    @Body() request: OptionRequest[],
  ): Promise<NormalResponse> {
    return this.optionService.save(productId, request);
  }

  @Get()
  public async findAll(
    @Param("productId") productId: string,
    @Query() query: BaseQuery,
  ): Promise<NormalResponse> {
    return this.optionService.findAll(productId, query);
  }

  @Get(":optionId")
  public async findOne(
    @Param("productId") productId: string,
    @Param("optionId") optionId: string,
  ): Promise<NormalResponse> {
    return this.optionService.findOne(productId, optionId);
  }

  @Put(":optionId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Manager)
  public async update(
    @Param("productId") productId: string,
    @Param("optionId") optionId: string,
    @Body() request: OptionRequest,
  ): Promise<NormalResponse> {
    return this.optionService.update(productId, optionId, request);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Manager)
  public async remove(
    @Param("productId") productId: string,
    @Body() request: OptionDelete[],
  ): Promise<NormalResponse> {
    return this.optionService.remove(productId, request);
  }
}
