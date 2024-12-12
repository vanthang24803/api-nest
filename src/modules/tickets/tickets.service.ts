import { UntilService } from "@/common";
import { Ticket } from "@/database/entities";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class TicketsService {
  constructor(
    private readonly logger: Logger,
    private readonly util: UntilService,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  public async save() {}
}
