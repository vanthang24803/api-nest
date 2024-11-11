import { UntilService, UploadService } from "@/common";
import { User } from "@/database/entities";
import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProfileResponse, UpdatePasswordRequest, ProfileRequest } from "./dto";
import * as bcrypt from "bcrypt";
import { NormalResponse } from "@/shared";

@Injectable()
export class MeService {
  constructor(
    private readonly logger: Logger,
    private readonly util: UntilService,
    private readonly upload: UploadService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async profile(user: User): Promise<NormalResponse> {
    const existingUser = await this.userRepository.findOne({
      where: {
        id: user.id,
      },
    });

    if (!existingUser) throw new UnauthorizedException("Account not found!");

    const covertUser = {
      ...existingUser,
      fullName: `${existingUser.firstName} ${existingUser.lastName}`,
      roles: existingUser.roles.map((item) => item.role),
    };

    return this.util.buildSuccessResponse(
      this.util.mapToDto(covertUser, ProfileResponse),
    );
  }

  public async updateProfile(
    user: User,
    request: ProfileRequest,
  ): Promise<NormalResponse> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: {
          id: user.id,
        },
      });

      if (!existingUser) throw new UnauthorizedException("Account not found!");

      await this.userRepository.update(existingUser.id, {
        ...request,
      });

      return this.util.buildSuccessResponse({
        message: "Updated profile successfully!",
      });
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException(err);
    }
  }

  public async updatePassword(user: User, request: UpdatePasswordRequest) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: {
          id: user.id,
        },
      });

      if (!existingUser) throw new UnauthorizedException("Account not found!");

      const isMatchPassword = await bcrypt.compare(
        request.oldPassword,
        existingUser.password,
      );

      if (!isMatchPassword)
        throw new ForbiddenException("Password doesn't matching!");

      const newPassword = await bcrypt.hash(request.newPassword, 10);

      await this.userRepository.update(existingUser.id, {
        password: newPassword,
      });

      return this.util.buildSuccessResponse({
        message: "Updated Password Successfully!",
      });
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException(err);
    }
  }
}
