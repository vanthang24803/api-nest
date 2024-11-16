import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductRequest, UpdateProductRequest } from "./dto";
import { ApiTags } from "@nestjs/swagger";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { BaseQuery, NormalResponse } from "@/shared";

@Controller("products")
@ApiTags("Products")
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: "thumbnail",
        maxCount: 1,
      },
      {
        name: "photos",
        maxCount: 5,
      },
    ]),
  )
  public async save(
    @Body()
    request: ProductRequest,
    @UploadedFiles()
    files: {
      thumbnail: Express.Multer.File[];
      photos?: Express.Multer.File[];
    },
  ) {
    return this.productService.save(request, files[0].thumbnail, files.photos);
  }

  @Get()
  public async findAll(@Query() query: BaseQuery): Promise<NormalResponse> {
    return this.productService.findAll(query);
  }

  @Get(":id")
  public async findOne(@Param("id") id: string): Promise<NormalResponse> {
    return this.productService.findOne(id);
  }

  @Put(":id")
  public async update(
    @Param("id") id: string,
    @Body() request: UpdateProductRequest,
  ): Promise<NormalResponse> {
    return this.productService.update(id, request);
  }

  @Delete(":id")
  public async remove(@Param("id") id: string): Promise<NormalResponse> {
    return this.productService.remove(id);
  }
}
