import { RegisterRequest, RefreshToken } from "@/modules/auth/dto";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Role as RoleEnum } from "@/shared";
import { JwtPayload, JwtSign, Payload } from "@/shared/interfaces";
import { UntilService } from "../services";
import { Role, Token, User } from "@/database/entities";

@Injectable()
export class AuthenticationService {
  private secretKey: string;
  private refreshKey: string;

  constructor(
    private readonly logger: Logger,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
    private readonly util: UntilService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {
    this.secretKey = this.configService.get<string>("JWT_SECRET");
    this.refreshKey = this.configService.get<string>("JWT_REFRESH");
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
        role: RoleEnum.Customer,
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
  ): Promise<User | null> {
    const account = await this.userRepository.findOne({
      where: {
        email,
      },
      relations: {
        roles: true,
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

  public async findUser(payload: JwtPayload): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: {
        id: payload.sub,
      },
      relations: {
        roles: true,
      },
    });

    if (!user) throw new UnauthorizedException();

    return user;
  }

  public async jwtSign(data: Payload): Promise<JwtSign> {
    const payload: JwtPayload = {
      payload: { ...data },
      sub: data.id,
    };

    const token = await this.tokenRepository.findOne({
      where: {
        name: "Refresh",
        userId: payload.sub,
      },
    });

    const result = {
      accessToken: this.jwt.sign(payload, {
        secret: this.secretKey,
        expiresIn: "7d",
      }),
      refreshToken: this.jwt.sign(payload, {
        secret: this.refreshKey,
        expiresIn: "30d",
      }),
    };

    if (!token) {
      await this.tokenRepository.save({
        name: "Refresh",
        value: result.refreshToken,
        userId: payload.sub,
      });
    } else {
      await this.tokenRepository.update(token.id, {
        value: result.refreshToken,
      });
    }

    return result;
  }

  public async refreshToken(request: RefreshToken): Promise<JwtSign> {
    try {
      const payload: JwtPayload = this.jwt.verify(request.token, {
        secret: this.refreshKey,
      });

      const refreshToken = await this.tokenRepository.findOne({
        where: {
          userId: payload.sub,
          name: "Refresh",
        },
      });

      if (!refreshToken) throw new ForbiddenException();

      const { exp, ...payloadWithoutExp } = payload;

      const accessToken = this.jwt.sign(payloadWithoutExp, {
        secret: this.secretKey,
        expiresIn: "7d",
      });

      if (exp && exp > this.util.getCurrentTime()) {
        return {
          accessToken,
          refreshToken: refreshToken.value,
        };
      } else {
        const newRefreshToken = this.jwt.sign(payloadWithoutExp, {
          secret: this.refreshKey,
          expiresIn: "30d",
        });

        await this.tokenRepository.update(refreshToken.id, {
          value: newRefreshToken,
        });

        return {
          accessToken,
          refreshToken: newRefreshToken,
        };
      }
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException(err);
    }
  }

  public async logout(user: User): Promise<boolean> {
    try {
      const refreshToken = await this.tokenRepository.findOne({
        where: {
          userId: user.id,
          name: "Refresh",
        },
      });

      if (refreshToken) {
        await this.tokenRepository.delete(refreshToken.id);
      }

      return true;
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException(err);
    }
  }
}
