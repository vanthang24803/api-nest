import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.getOrThrow<string>("DB_HOST"),
        port: config.getOrThrow<number>("DB_PORT"),
        database: config.getOrThrow<string>("DB_NAME"),
        username: config.getOrThrow<string>("DB_USERNAME"),
        password: config.getOrThrow<string>("DB_PASSWORD"),
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
