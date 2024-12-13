import { TicketsService } from "@/modules/tickets/tickets.service";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class TasksService {
  constructor(
    private readonly logger: Logger,
    private readonly ticketService: TicketsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async checkTicket() {
    this.logger.debug(`Handler`);
    await this.ticketService.checkExpireTicket();
  }
}
