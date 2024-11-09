import { Logger, Module } from "@nestjs/common";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { CommonModule } from "@/common/common.module";
import * as entities from "@/database/entities";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature(Object.values(entities))],
  controllers: [CatalogController],
  providers: [CatalogService, Logger],
})
export class CatalogModule {}
