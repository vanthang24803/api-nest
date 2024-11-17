import { APP_FILTER } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { DatabaseModule } from "@/database/database.module";
import { CommonModule } from "@/common/common.module";
import { CatalogModule } from "@/modules/catalog/catalog.module";
import { MeModule } from "@/modules/me/me.module";
import { FileValidationMiddleware } from "@/common/middlewares";
import { HttpExceptionFilter } from "@/common/filters";
import { ProductsModule } from "@/modules/products/products.module";
import { OptionsModule } from "@/modules/options/options.module";
import { PhotosModule } from "@/modules/photos/photos.module";
import { RedisModule } from "./redis/redis.module";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DatabaseModule,
    CommonModule,
    CatalogModule,
    MeModule,
    ProductsModule,
    OptionsModule,
    PhotosModule,
    RedisModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FileValidationMiddleware).forRoutes();
  }
}
