import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PhotosService } from "./photos.service";
import { PhotoDelete } from "./dto";
import { BaseQuery, NormalResponse, Role } from "@/shared";
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from "@nestjs/platform-express";
import { JwtAuthGuard } from "@/common/guards";
import { Roles } from "@/common/decorators";

@Controller("products/:productId/photos")
@ApiTags("Photo")
export class PhotosController {
  constructor(private readonly photoService: PhotosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin, Role.Manager)
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: "photos",
        maxCount: 5,
      },
    ]),
  )
  public async save(
    @Param("productId") productId: string,
    @UploadedFiles()
    files: {
      photos: Express.Multer.File[];
    },
  ): Promise<NormalResponse> {
    return this.photoService.save(productId, files.photos);
  }

  @Get()
  public async findAll(
    @Param("productId") productId: string,
    @Query() query: BaseQuery,
  ): Promise<NormalResponse> {
    return this.photoService.findAll(productId, query);
  }

  @Get(":photoId")
  public async findOne(
    @Param("productId") productId: string,
    @Param("photoId") photoId: string,
  ): Promise<NormalResponse> {
    return this.photoService.findOne(productId, photoId);
  }

  @Put(":photoId")
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin, Role.Manager)
  @UseInterceptors(FileInterceptor("photos"))
  public async update(
    @Param("productId") productId: string,
    @Param("photoId") photoId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<NormalResponse> {
    return this.photoService.update(productId, photoId, file);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin, Role.Manager)
  public async remove(
    @Param("productId") productId: string,
    @Body() request: PhotoDelete[],
  ): Promise<NormalResponse> {
    return this.photoService.remove(productId, request);
  }
}
