import { Cache } from "cache-manager";
import { Injectable, Inject } from "@nestjs/common";
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from "@nestjs/terminus";
import { CACHE_MANAGER } from "@nestjs/cache-manager";

@Injectable()
export class RedisCacheHealthIndicator extends HealthIndicator {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.cacheManager.set("health-check-key", "health-check-value", 10);
      const value = await this.cacheManager.get("health-check-key");

      if (value !== "health-check-value") {
        throw new Error("Cache value mismatch");
      }

      return this.getStatus(key, true);
    } catch {
      throw new HealthCheckError(
        "Redis Cache check failed",
        this.getStatus(key, false),
      );
    }
  }
}
