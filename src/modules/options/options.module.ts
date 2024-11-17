import { Logger, Module } from "@nestjs/common";
import { OptionsService } from "./options.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product, Option } from "@/database/entities";
import { OptionsController } from "./options.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Product, Option])],
  controllers: [OptionsController],
  providers: [OptionsService, Logger],
})
export class OptionsModule {}
