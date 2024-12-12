import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { TerminusModule } from "@nestjs/terminus";
import { RedisCacheHealthIndicator } from "./redis.indicator";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    TerminusModule,
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.getOrThrow<string>("REDIS_HOST", "localhost"),
        port: Number(config.getOrThrow<number>("REDIS_PORT", 6379)),
        ttl: 60 * 10,
      }),
    }),
  ],
  controllers: [HealthController],
  providers: [RedisCacheHealthIndicator],
})
export class HealthModule {}
