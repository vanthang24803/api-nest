import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.getOrThrow<string>("DB_HOST", "localhost"),
        port: config.getOrThrow<number>("DB_PORT", 5432),
        database: config.getOrThrow<string>("DB_NAME", "postgres"),
        username: config.getOrThrow<string>("DB_USERNAME", "postgres"),
        password: config.getOrThrow<string>("DB_PASSWORD"),
        synchronize: config.get<string>("NODE_ENV") ? false : true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
