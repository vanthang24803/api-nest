import { Injectable, UnauthorizedException } from "@nestjs/common";
import { NormalResponse, Payload } from "@/shared";
import { UntilService, AuthenticationService } from "@/common";
import { RegisterRequest, LoginRequest, RefreshToken } from "./dto";

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

  public async login(loginRequest: LoginRequest): Promise<NormalResponse> {
    const check = await this.authenticationService.validateUser(
      loginRequest.email,
      loginRequest.password,
    );

    if (!check) throw new UnauthorizedException();

    const payload: Payload = {
      id: check.id,
      fullName: `${check.firstName} ${check.lastName}`,
      avatar: check.avatar,
      roles: check.roles.map((item) => item.role),
    };

    return this.util.buildSuccessResponse(
      await this.authenticationService.jwtSign(payload),
    );
  }

  public async refreshToken(
    refreshToken: RefreshToken,
  ): Promise<NormalResponse> {
    return this.util.buildSuccessResponse(
      await this.authenticationService.refreshToken(refreshToken),
    );
  }
}
