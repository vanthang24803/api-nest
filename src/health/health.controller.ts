import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HealthCheckService, TypeOrmHealthIndicator } from "@nestjs/terminus";
import { RedisCacheHealthIndicator } from "./redis.indicator";

@Controller("health")
@ApiTags("Heath")
export class HealthController {
  constructor(
    private readonly heath: HealthCheckService,
    private readonly database: TypeOrmHealthIndicator,
    private readonly redis: RedisCacheHealthIndicator,
  ) {}

  @Get()
  public ping() {
    return this.heath.check([
      async () => this.database.pingCheck("typeorm"),
      async () => this.redis.isHealthy("redis"),
    ]);
  }
}
