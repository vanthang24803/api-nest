import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { CommonModule } from "./common/common.module";
import { CatalogModule } from "./modules/catalog/catalog.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DatabaseModule,
    CommonModule,
    CatalogModule,
  ],
  providers: [],
})
export class AppModule {}
