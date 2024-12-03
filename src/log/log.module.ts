import { Global, Module } from "@nestjs/common";
import { LoggerFactory } from "./log.service";
import { WinstonModule } from "nest-winston";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: (loggerFactory: LoggerFactory) => loggerFactory.registerLog(),
      inject: [LoggerFactory, ConfigService],
    }),
  ],
  providers: [LoggerFactory],
  exports: [LoggerFactory],
})
export class LogModule {}
