import { Injectable } from "@nestjs/common";
import { NormalResponse } from "@/shared";
import { UntilService, AuthenticationService } from "@/common";

@Injectable()
export class AuthService {
  constructor(
    private readonly util: UntilService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  getHelloWorld(): NormalResponse {
    return this.util.buildSuccessResponse("Hello, World");
  }
}
