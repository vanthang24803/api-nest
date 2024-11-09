import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DatabaseModule,
    CommonModule,
  ],
  providers: [],
})
export class AppModule {}
