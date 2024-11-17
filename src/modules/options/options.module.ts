import { Logger, Module } from "@nestjs/common";
import { OptionsService } from "./options.service";
import { CommonModule } from "@/common/common.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import * as entities from "@/database/entities";
import { JwtStrategy } from "@/common/strategies";
import { AuthenticationService } from "@/common";
import { OptionsController } from "./options.controller";

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature(Object.values(entities)),
    JwtModule,
  ],
  controllers: [OptionsController],
  providers: [OptionsService, AuthenticationService, JwtStrategy, Logger],
})
export class OptionsModule {}
