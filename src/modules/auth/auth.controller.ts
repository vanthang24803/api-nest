import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterRequest } from "./dto/register.request";
import { ApiTags } from "@nestjs/swagger";
import { NormalResponse } from "@/shared";
import { LoginRequest } from "./dto/login.request";
import { CurrentUser } from "@/common/decorators";
import { JwtAuthGuard } from "@/common/guards";
import { Logger } from "@nestjs/common";

@Controller("auth")
@ApiTags("Authentication")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {}

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

  @Get("me")
  @UseGuards(JwtAuthGuard)
  public me(@CurrentUser() user): Promise<any> {
    this.logger.log("Hello World");
    return user;
  }
}
