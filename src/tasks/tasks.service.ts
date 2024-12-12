import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class TasksService {
  constructor(private readonly logger: Logger) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  handleCron() {
    this.logger.debug(`Now is ${new Date().toISOString()}`);
  }
}
