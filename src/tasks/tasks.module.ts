import { Global, Logger, Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { ScheduleModule } from "@nestjs/schedule";

@Global()
@Module({
  imports: [ScheduleModule.forRoot({})],
  providers: [TasksService, Logger],
})
export class TasksModule {}
