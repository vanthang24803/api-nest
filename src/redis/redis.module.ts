import { Global, Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
import { RedisService } from "./redis.service";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.getOrThrow<string>("REDIS_HOST", "localhost"),
        port: Number(config.getOrThrow<number>("REDIS_PORT", 6379)),
        ttl: 60 * 5,
      }),
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
