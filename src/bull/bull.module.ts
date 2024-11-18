import { Global, Module, Logger } from "@nestjs/common";
import { BullModule as Bull } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
  imports: [
    Bull.forRootAsync({
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get("REDIS_HOST", "localhost"),
          port: config.get("REDIS_PORT", 6379),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: true,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [Logger],
})
export class BullModule {}
