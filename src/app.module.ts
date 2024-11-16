import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { CommonModule } from "./common/common.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { MeModule } from "./modules/me/me.module";
import { FileValidationMiddleware } from "@/common/middlewares";
import { HttpExceptionFilter } from "@/common/filters";
import { APP_FILTER } from "@nestjs/core";
import { ProductsModule } from "./modules/products/products.module";
import { NestjsFormDataModule } from "nestjs-form-data";
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
    NestjsFormDataModule,
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
