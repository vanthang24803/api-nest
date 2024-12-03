import helmet from "helmet";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import { ValidationError } from "class-validator";

import { AppModule } from "@/app.module";
import { NestFactory } from "@nestjs/core";
import { WinstonModule } from "nest-winston";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe, InternalServerErrorException } from "@nestjs/common";
import { LoggerFactory } from "./log/log.service";

async function bootstrap() {
  // !: Application
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: true,
    rawBody: true,
  });

  // TODO: Logger
  const loggerFactory = app.get(LoggerFactory);

  const loggerOptions = loggerFactory.registerLog();

  if (loggerOptions) {
    app.useLogger(WinstonModule.createLogger(loggerOptions));
  }

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

  // TODO: Cookies
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

  // TODO: Redirect API Docs
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
