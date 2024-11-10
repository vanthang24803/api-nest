import { Controller, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { MeService } from "./me.service";
import { JwtAuthGuard } from "@/common/guards";

@Controller("me")
@ApiTags("Profile")
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}
}
