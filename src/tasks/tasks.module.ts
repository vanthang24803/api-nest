import { Global, Logger, Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { ScheduleModule } from "@nestjs/schedule";
import { TicketsModule } from "@/modules/tickets/tickets.module";

@Global()
@Module({
  imports: [ScheduleModule.forRoot({}), TicketsModule],
  providers: [TasksService, Logger],
})
export class TasksModule {}
