import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthenticationService } from "../providers";
import { Payload } from "@/shared/interfaces/jwt.interface";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authenticationService: AuthenticationService) {
    super({
      usernameField: "email",
    });
  }

  public async validate(email: string, password: string): Promise<Payload> {
    const user = await this.authenticationService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    console.log(user);

    return {
      id: user.id,
      avatar: user.avatar,
      fullName: `${user.firstName} ${user.lastName}`,
    };
  }
}
