import { Logger, Module } from "@nestjs/common";
import { GeminiService } from "./gemini.service";
import { GeminiController } from "./gemini.controller";

@Module({
  providers: [GeminiService, Logger],
  controllers: [GeminiController],
})
export class GeminiModule {}
