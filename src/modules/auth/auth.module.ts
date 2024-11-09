import { Logger, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CommonModule } from "@/common/common.module";
import * as entities from "@/database/entities";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { AuthenticationService } from "@/common";
import { JwtStrategy, LocalStrategy } from "@/common/strategies";

@Module({
  imports: [
    JwtModule,
    CommonModule,
    TypeOrmModule.forFeature(Object.values(entities)),
    PassportModule.register({
      defaultStrategy: "jwt",
    }),
  ],
  providers: [
    AuthService,
    AuthenticationService,
    JwtStrategy,
    LocalStrategy,
    Logger,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
