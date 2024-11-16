import { UntilService } from "@/common";
import { Product, Option } from "@/database/entities";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class OptionsService {
  constructor(
    private readonly util: UntilService,
    private readonly logger: Logger,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
  ) {}
}
