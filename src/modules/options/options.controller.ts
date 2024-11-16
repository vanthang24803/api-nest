import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { OptionsService } from "./options.service";

@Controller("options")
@ApiTags("Options")
export class OptionsController {
  constructor(private readonly optionService: OptionsService) {}
}
