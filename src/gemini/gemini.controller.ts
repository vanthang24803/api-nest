import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { GeminiService } from "./gemini.service";

@Controller("gemini")
@ApiTags("Gemini")
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}
}
