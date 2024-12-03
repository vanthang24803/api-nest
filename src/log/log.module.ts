import { Global, Module } from "@nestjs/common";
import { LoggerFactory } from "./log.service";
import { WinstonModule } from "nest-winston";

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: (loggerFactory: LoggerFactory) => loggerFactory.registerLog(),
      inject: [LoggerFactory],
    }),
  ],
  providers: [LoggerFactory],
  exports: [LoggerFactory],
})
export class LogModule {}
