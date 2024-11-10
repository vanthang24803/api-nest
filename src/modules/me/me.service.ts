import { UntilService } from "@/common";
import { User } from "@/database/entities";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class MeService {
  constructor(
    private readonly logger: Logger,
    private readonly util: UntilService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
}
