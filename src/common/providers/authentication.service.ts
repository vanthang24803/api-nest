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
import { DataSource, Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { EEmailType as EmailType, Role as RoleEnum } from "@/shared";
import { JwtPayload, JwtSign, Payload } from "@/shared/interfaces";
import { UntilService } from "@/common/services";
import { Role, Token, User } from "@/database/entities";
import { RedisService } from "@/redis/redis.service";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { AuthEvent, AuthProcess } from "@/shared/events";

@Injectable()
export class AuthenticationService {
  private secretKey: string;
  private refreshKey: string;

  constructor(
    private readonly logger: Logger,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
    private readonly util: UntilService,
    private readonly redis: RedisService,
    @InjectQueue(AuthEvent.Mail)
    private readonly bull: Queue,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly dataSource: DataSource,
  ) {
    this.secretKey = this.configService.get<string>("JWT_SECRET");
    this.refreshKey = this.configService.get<string>("JWT_REFRESH");
  }

  public async register(request: RegisterRequest) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

      if (!customerRole)
        throw new NotFoundException("Customer role not found!");

      const newAccount = this.userRepository.create({
        ...request,
        password: await bcrypt.hash(request.password, 10),
        avatar: ``,
        roles: [customerRole],
      });

      await this.userRepository.save(newAccount);

      const token = this.jwt.sign(
        {
          payload: {
            id: newAccount.id,
            avatar: newAccount.avatar ?? "",
            fullName: `${newAccount.firstName} ${newAccount.lastName}`,
            roles: newAccount.roles.map((item) => item.role),
            email: newAccount.email,
          },
          sub: newAccount.id,
        } as JwtPayload,
        {
          secret: this.secretKey,
          expiresIn: "1h",
        },
      );

      await this.bull.add(AuthProcess.SendMailWithToken, {
        fullName: `${newAccount.firstName} ${newAccount.lastName}`,
        toEmail: newAccount.email,
        type: EmailType.VERIFY_ACCOUNT,
        userId: newAccount.id,
        token: token,
      });

      await this.tokenRepository.save({
        name: "Verify_Account",
        value: token,
        userId: newAccount.id,
      });

      await queryRunner.commitTransaction();

      return {
        message: "Create account successfully!",
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err);
      throw new BadRequestException(err);
    } finally {
      await queryRunner.release();
    }
  }

  public async validateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const account = await this.userRepository.findOne({
      where: {
        email,
        isEmailConfirm: true,
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
    const cacheKey = `Account_${data.email}`;

    const cache = await this.redis.get<JwtSign>(cacheKey);

    if (cache) return cache;

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

    await this.redis.set(cacheKey, result, 60 * 60);

    return result;
  }

  public async verifyAccount(token: string) {
    try {
      const payload: JwtPayload = this.jwt.verify(token, {
        secret: this.secretKey,
      });

      const verifyMailToken = await this.tokenRepository.findOne({
        where: {
          userId: payload.sub,
          name: "Verify_Account",
        },
      });

      if (!verifyMailToken) throw new ForbiddenException();

      const { exp, ...payloadWithoutExp } = payload;

      if (!(exp && exp > this.util.getCurrentTime())) {
        const newToken = this.jwt.sign(payload, {
          secret: this.secretKey,
          expiresIn: "1h",
        });

        await this.bull.add(AuthProcess.SendMailWithToken, {
          fullName: payloadWithoutExp.payload.fullName,
          toEmail: payloadWithoutExp.payload.email,
          type: EmailType.VERIFY_ACCOUNT,
          userId: payloadWithoutExp.sub,
          token: newToken,
        });

        await this.tokenRepository.update(verifyMailToken.id, {
          value: newToken,
        });

        return this.util.buildSuccessResponse({
          message: "Token resend successfully!",
        });
      }

      await this.tokenRepository.remove(verifyMailToken);

      await this.userRepository.update(payload.sub, {
        isEmailConfirm: true,
      });

      return this.util.buildSuccessResponse({
        message: "Verify email successfully!",
      });
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException(err);
    }
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
      await this.redis.del(`Account_${user.email}`);
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
