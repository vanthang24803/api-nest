import { Logger, Module } from "@nestjs/common";
import { MeController } from "./me.controller";
import { MeService } from "./me.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { User, Role } from "@/database/entities";

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), JwtModule],
  controllers: [MeController],
  providers: [MeService, Logger],
})
export class MeModule {}
