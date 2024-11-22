import helmet from "helmet";
import winston from "winston";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import { ValidationError } from "class-validator";

import { AppModule } from "@/app.module";
import { NestFactory } from "@nestjs/core";
import { WinstonModule } from "nest-winston";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe, InternalServerErrorException } from "@nestjs/common";

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === "production";

  // !: Application
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: true,
    rawBody: true,
    logger: isProduction
      ? WinstonModule.createLogger({
          level: "info",
          format: winston.format.json(),
          transports: [
            new winston.transports.File({
              filename: "logs/error.log",
              level: "error",
            }),
            new winston.transports.File({
              filename: "logs/query.log",
              level: "query",
            }),
            new winston.transports.File({
              filename: "logs/info.log",
              level: "info",
            }),
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.colorize(),
                winston.format.json(),
              ),
            }),
          ],
        })
      : undefined,
  });

  // TODO: Cors
  app.enableCors();

  // TODO: Versions
  app.setGlobalPrefix(`api/v${process.env["VERSION"] || "1"}`);
  app.use(express.urlencoded({ extended: true }));

  // TODO: Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) =>
        new InternalServerErrorException(validationErrors),
    }),
  );

  // TODO: Cookie
  app.use(cookieParser());

  app.use(helmet());

  //  TODO: Swagger
  const config = new DocumentBuilder()
    .setTitle("API")
    .setDescription("")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, documentFactory);

  // TODO: Redirect
  app.getHttpAdapter().get("/", (_, res) => {
    res.redirect(301, "/docs");
  });

  // TODO: PORT
  await app.listen(process.env.PORT ?? 3000);
}

// !: Application
bootstrap()
  .then(() =>
    console.log(
      `Application running on port ${process.env.PORT ?? 3000}, ${new Date().toLocaleString()} ✅`,
    ),
  )
  .catch(console.error);
