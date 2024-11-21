import { Job } from "bull";
import { MailService } from "@/mail/mail.service";
import { OrderEvent, OrderEventProcess } from "@/shared/events";
import { Process, Processor } from "@nestjs/bull";
import { BadRequestException, Logger } from "@nestjs/common";
import { SendOrderMailHandler } from "./dto";

@Processor(OrderEvent)
export class OrderConsumer {
  constructor(
    private readonly logger: Logger,
    private readonly mail: MailService,
  ) {}

  @Process(OrderEventProcess.SendMaiOrder)
  public async sendMailWithToken(job: Job<SendOrderMailHandler>) {
    try {
      const handler = job.data;

      await this.mail.sendOrderMail(handler.subject, handler.message);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(`Error for queue : ${err}`);
    }
  }
}
