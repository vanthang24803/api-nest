import { Module } from '@nestjs/common';
import { OptionsService } from './options.service';

@Module({
  providers: [OptionsService]
})
export class OptionsModule {}
