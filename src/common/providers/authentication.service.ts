import { Users } from "@/database/entities";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class AuthenticationService {
  constructor(
    private jwt: JwtService,
    private configService: ConfigService,
    @InjectRepository(Users) private userRepository: Repository<Users>,
  ) {}
}
