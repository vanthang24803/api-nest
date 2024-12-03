import * as winston from "winston";
import { Injectable } from "@nestjs/common";
import { WinstonModuleOptions } from "nest-winston";

@Injectable()
export class LoggerFactory {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === "production";
  }

  registerLog(): WinstonModuleOptions | undefined {
    if (!this.isProduction) {
      return undefined;
    }

    return {
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
    };
  }
}
