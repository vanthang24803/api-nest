import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { CommonModule } from "./common/common.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { MeModule } from "./modules/me/me.module";
import { FileValidationMiddleware } from "@/common/middleware";
import { HttpExceptionFilter } from "@/common/filters";
import { APP_FILTER } from "@nestjs/core";
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
    consumer
      .apply(FileValidationMiddleware)
      .forRoutes({ path: "/path", method: RequestMethod.ALL });
  }
}
