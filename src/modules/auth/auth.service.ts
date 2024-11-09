import { Injectable, UnauthorizedException } from "@nestjs/common";
import { NormalResponse, Payload } from "@/shared";
import { UntilService, AuthenticationService } from "@/common";
import { RegisterRequest } from "./dto/register.request";
import { LoginRequest } from "./dto/login.request";

@Injectable()
export class AuthService {
  constructor(
    private readonly util: UntilService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  public async register(
    registerRequest: RegisterRequest,
  ): Promise<NormalResponse> {
    return this.util.buildCreatedResponse(
      await this.authenticationService.register(registerRequest),
    );
  }

  public async login(loginRequest: LoginRequest) {
    const check = await this.authenticationService.validateUser(
      loginRequest.email,
      loginRequest.password,
    );

    if (!check) throw new UnauthorizedException();

    const payload: Payload = {
      id: check.id,
      fullName: `${check.firstName} ${check.lastName}`,
      avatar: check.avatar,
    };

    return this.util.buildSuccessResponse(
      this.authenticationService.jwtSign(payload),
    );
  }
}
