import { Logger, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import * as entities from "@/database/entities";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { AuthenticationService } from "@/common";
import { JwtStrategy, LocalStrategy } from "@/common/strategies";

@Module({
  imports: [
    JwtModule,
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
