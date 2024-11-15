import { Logger, Module } from "@nestjs/common";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { CommonModule } from "@/common/common.module";
import * as entities from "@/database/entities";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "@/common/strategies";
import { AuthenticationService } from "@/common";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature(Object.values(entities)),
    JwtModule,
  ],
  controllers: [CatalogController],
  providers: [CatalogService, Logger, JwtStrategy, AuthenticationService],
})
export class CatalogModule {}
