import { Global, Logger, Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Mail } from "@/database/entities";

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow<string>("MAIL_HOST", "smtp.gmail.com"),
          port: Number(config.getOrThrow<number>("MAIL_PORT", 587)),
          secure: config.getOrThrow<boolean>("MAIL_SECURE", false),
          auth: {
            user: config.getOrThrow<string>("MAIL_USER"),
            password: config.getOrThrow<string>("MAIL_PASSWORD"),
          },
        },
        defaults: {
          from: config.getOrThrow<string>("MAIL_FROM"),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Mail]),
  ],
  providers: [MailService, Logger],
  exports: [MailService],
})
export class MailModule {}
