import { UntilService } from "@/common";
import { Product } from "@/database/entities";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class OrdersService {
  constructor(
    private readonly logger: Logger,
    private readonly util: UntilService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
}
