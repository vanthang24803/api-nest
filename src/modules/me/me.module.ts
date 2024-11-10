import { Logger, Module } from "@nestjs/common";
import { MeController } from "./me.controller";
import { MeService } from "./me.service";
import { CommonModule } from "@/common/common.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import * as entities from "@/database/entities";
import { AuthenticationService } from "@/common";
import { JwtStrategy } from "@/common/strategies";

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature(Object.values(entities)),
    JwtModule,
  ],
  controllers: [MeController],
  providers: [MeService, AuthenticationService, JwtStrategy, Logger],
})
export class MeModule {}
