import { Body, Controller, Get, Put, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { MeService } from "./me.service";
import { JwtAuthGuard } from "@/common/guards";
import { NormalResponse } from "@/shared";
import { CurrentUser } from "@/common/decorators";
import { User } from "@/database/entities";
import { ProfileRequest, UpdatePasswordRequest } from "./dto";

@Controller("me")
@ApiTags("Profile")
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  public async getProfile(@CurrentUser() user: User): Promise<NormalResponse> {
    return this.meService.profile(user);
  }

  @Put()
  public async updateProfile(
    @CurrentUser() user: User,
    @Body() request: ProfileRequest,
  ): Promise<NormalResponse> {
    return this.meService.updateProfile(user, request);
  }

  @Put("password")
  public async updatePassword(
    @CurrentUser() user: User,
    @Body() request: UpdatePasswordRequest,
  ): Promise<NormalResponse> {
    return this.meService.updatePassword(user, request);
  }
}
