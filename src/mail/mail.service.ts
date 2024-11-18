import { MailerService } from "@nestjs-modules/mailer";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { MailRequest, MailWithTokenEvent } from "./dto";
import { EEmailType } from "@/shared";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Mail } from "@/database/entities";
import { Repository } from "typeorm";

@Injectable()
export class MailService {
  private readonly appClient: string;

  constructor(
    private readonly mailer: MailerService,
    private readonly logger: Logger,
    private readonly config: ConfigService,
    @InjectRepository(Mail)
    private readonly mailRepository: Repository<Mail>,
  ) {
    this.appClient = config.getOrThrow<string>(
      "APP_CLIENT",
      "http://localhost:3000",
    );
  }

  public async sendMailWithToken(mail: MailWithTokenEvent) {
    const { type, toEmail, fullName, userId, token } = mail;
    let subject: string;
    let templateType: EEmailType;
    let link: string;

    switch (type) {
      case EEmailType.VERIFY_ACCOUNT:
        subject = "Xác nhận tài khoản";
        templateType = EEmailType.VERIFY_ACCOUNT;
        link = `${this.appClient}/verify-account?userId=${userId}&token=${token}`;
        break;

      case EEmailType.FORGOT_PASSWORD:
        subject = "Đổi mật khẩu";
        templateType = EEmailType.FORGOT_PASSWORD;
        link = `${this.appClient}/reset-password?userId=${userId}&token=${token}`;
        break;

      default:
        throw new BadRequestException("Unsupported email type");
    }

    const mailTemplate = await this.getMailTemplate(templateType);

    const htmlContent = this.processEmailTemplate(
      mailTemplate.template,
      fullName,
      link,
    );

    const mailRequest: MailRequest = {
      toEmail,
      message: htmlContent,
      subject,
    };

    await this.sendMail(mailRequest);
  }

  private async getMailTemplate(type: EEmailType): Promise<Mail> {
    const mailTemplate = await this.mailRepository.findOne({
      where: { type },
    });

    if (!mailTemplate) {
      throw new NotFoundException("Mail template not found!");
    }

    return mailTemplate;
  }

  private processEmailTemplate(
    template: string,
    fullName: string,
    link: string,
  ): string {
    let htmlContent = template;
    htmlContent = htmlContent.replace("{USERNAME}", fullName);
    htmlContent = htmlContent.replace("{LINK}", link);
    return htmlContent;
  }

  private async sendMail(mail: MailRequest) {
    try {
      await this.mailer.sendMail({
        to: mail.toEmail,
        subject: mail.subject,
        html: mail.message,
      });
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(`Send mail error by ${err}`);
    }
  }
}
