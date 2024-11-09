import { Roles, Users } from "@/database/entities";
import { RegisterRequest } from "@/modules/auth/dto/register.request";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Role } from "@/shared";
import {
  JwtPayload,
  JwtSign,
  Payload,
} from "@/shared/interfaces/jwt.interface";

@Injectable()
export class AuthenticationService {
  private secretKey: string;
  private refreshKey: string;
  private nodeEnv: string;
  private readonly SECRET_COOKIES = "Secret";
  private readonly REFRESH_COOKIES = "Refresh";

  constructor(
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    @InjectRepository(Roles) private readonly roleRepository: Repository<Roles>,
  ) {
    this.secretKey = this.configService.get<string>("JWT_SECRET");
    this.refreshKey = this.configService.get<string>("JWT_REFRESH");
    this.nodeEnv = this.configService.get("NODE_ENV");
  }

  public async register(request: RegisterRequest) {
    const isExistingEmail = await this.userRepository.findOne({
      where: {
        email: request.email,
      },
    });
    if (isExistingEmail) throw new BadRequestException("Email existed!");

    const customerRole = await this.roleRepository.findOne({
      where: {
        role: Role.Customer,
      },
    });

    if (!customerRole) throw new NotFoundException("Customer role not found!");

    const newAccount = this.userRepository.create({
      ...request,
      password: await bcrypt.hash(request.password, 10),
      avatar: ``,
      roles: [customerRole],
    });

    await this.userRepository.save(newAccount);

    return {
      message: "Create account successfully!",
    };
  }

  public async validateUser(
    email: string,
    password: string,
  ): Promise<Users | null> {
    const account = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (account) {
      const isMatch = await bcrypt.compare(password, account.password);
      if (isMatch) {
        return account;
      }
    }

    return null;
  }

  public async findUser(payload: JwtPayload): Promise<Users | null> {
    const user = await this.userRepository.findOne({
      where: {
        id: payload.sub,
      },
    });

    if (!user) throw new UnauthorizedException();

    return user;
  }

  public jwtSign(data: Payload): JwtSign {
    const payload: JwtPayload = {
      ...data,
      sub: data.id,
    };

    return {
      accessToken: this.jwt.sign(payload, {
        secret: this.secretKey,
        expiresIn: "7d",
      }),
      refreshToken: this.jwt.sign(payload, {
        secret: this.refreshKey,
        expiresIn: "30d",
      }),
    };
  }
}
