import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiTags } from "@nestjs/swagger";
import { NormalResponse, Role } from "@/shared";
import { CurrentUser, Roles } from "@/common/decorators";
import { JwtAuthGuard, RolesGuard } from "@/common/guards";
import { RefreshToken, LoginRequest, RegisterRequest } from "./dto";
import { User } from "@/database/entities";

@Controller("auth")
@ApiTags("Authentication")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  public async register(
    @Body() request: RegisterRequest,
  ): Promise<NormalResponse> {
    return await this.authService.register(request);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async login(@Body() request: LoginRequest): Promise<NormalResponse> {
    return await this.authService.login(request);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  public async refreshToken(
    @Body() request: RefreshToken,
  ): Promise<NormalResponse> {
    return await this.authService.refreshToken(request);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Customer)
  public async logout(@CurrentUser() user: User): Promise<NormalResponse> {
    return await this.authService.logout(user);
  }
}
