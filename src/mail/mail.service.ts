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
import { Mail, Order } from "@/database/entities";
import { Repository } from "typeorm";
import { UntilService } from "@/common";

@Injectable()
export class MailService {
  private readonly appClient: string;

  constructor(
    private readonly logger: Logger,
    private readonly util: UntilService,
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
    @InjectRepository(Mail)
    private readonly mailRepository: Repository<Mail>,
  ) {
    this.appClient = config.getOrThrow<string>(
      "APP_CLIENT",
      "http://localhost:3000",
    );
  }

  public async sendOrderMail(subject: string, order: Order) {
    const { orderDetails, status, ...info } = order;
    const {
      id,
      customer,
      address,
      numberPhone,
      quantity,
      totalPrice,
      payment,
    } = info;

    const orderTemplate = await this.mailRepository.findOne({
      where: { type: EEmailType.ORDER },
    });

    if (!orderTemplate)
      throw new BadRequestException("Order mail template not found!");

    let htmlContent = orderTemplate.template;

    const lastedStatus = status.reduce(
      (latest, current) =>
        !latest || current.createdAt > latest.createdAt ? current : latest,
      null,
    );

    htmlContent = htmlContent
      .replace("{ID}", id)
      .replace("{CUSTOMER}", customer)
      .replace("{ADDRESS}", address)
      .replace("{PHONE}", numberPhone)
      .replace("{QUANTITY}", quantity.toString())
      .replace("{TOTAL_PRICE}", this.util.convertPrice(totalPrice))
      .replace("{PAYMENT}", this.util.convertPayment(payment))
      .replace(
        "{STATUS}",
        lastedStatus
          ? this.util.convertStatusOrder(lastedStatus.status)
          : "Trạng thái không xác định",
      );

    const detailsBuilder = orderDetails
      .map(
        (order) => `
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${order.productName}</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${order.price} VNĐ</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${order.optionName}</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${order.quantity}</td>
      </tr>
    `,
      )
      .join("");

    htmlContent = htmlContent.replace("{DETAILS}", detailsBuilder);

    const mailRequest: MailRequest = {
      toEmail: info.email,
      message: htmlContent,
      subject,
    };

    await this.sendMail(mailRequest);
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
