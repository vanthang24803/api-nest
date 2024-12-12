import { Logger, Module } from "@nestjs/common";
import { TicketsService } from "./tickets.service";
import { TicketsController } from "./tickets.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ticket } from "@/database/entities";

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  controllers: [TicketsController],
  providers: [TicketsService, Logger],
})
export class TicketsModule {}
