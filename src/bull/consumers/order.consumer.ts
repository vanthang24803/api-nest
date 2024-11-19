import { Job } from "bull";
import { MailService } from "@/mail/mail.service";
import { OrderEvent, OrderEventProcess } from "@/shared/events";
import { Process, Processor } from "@nestjs/bull";
import { BadRequestException, Logger } from "@nestjs/common";
import { Order } from "@/database/entities";

@Processor(OrderEvent)
export class OrderConsumer {
  constructor(
    private readonly logger: Logger,
    private readonly mail: MailService,
  ) {}

  @Process(OrderEventProcess.SendMaiOrder)
  public async sendMailWithToken(job: Job<Order>) {
    try {
      const jsonData = job.data;

      this.logger.debug(jsonData);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(`Error for queue : ${err}`);
    }
  }
}
