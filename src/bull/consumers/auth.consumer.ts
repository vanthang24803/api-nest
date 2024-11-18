import { MailWithTokenEvent } from "@/mail/dto";
import { MailService } from "@/mail/mail.service";
import { AuthEvent, AuthProcess } from "@/shared/events";
import { Processor, Process } from "@nestjs/bull";
import { BadRequestException, Logger } from "@nestjs/common";
import { Job } from "bull";

@Processor(AuthEvent.Mail)
export class EmailConsumer {
  constructor(
    private readonly mail: MailService,
    private readonly logger: Logger,
  ) {}

  @Process(AuthProcess.SendMailWithToken)
  public async sendMailWithToken(job: Job<MailWithTokenEvent>) {
    try {
      const jsonData = job.data;

      await this.mail.sendMailWithToken(jsonData);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(`Error for queue : ${err}`);
    }
  }
}
