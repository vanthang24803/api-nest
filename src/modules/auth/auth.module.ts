import { Logger, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import * as entities from "@/database/entities";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { AuthenticationService } from "@/common";
import { JwtStrategy, LocalStrategy } from "@/common/strategies";
import { BullModule } from "@nestjs/bull";
import { EmailConsumer } from "@/bull/consumers";
import { AuthEvent } from "@/shared/events";

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature(Object.values(entities)),
    PassportModule.register({
      defaultStrategy: "jwt",
    }),
    BullModule.registerQueueAsync({
      name: AuthEvent.Mail,
    }),
  ],
  providers: [
    AuthService,
    AuthenticationService,
    JwtStrategy,
    LocalStrategy,
    Logger,
    EmailConsumer,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
