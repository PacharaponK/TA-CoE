import { Module } from '@nestjs/common';
import { TasModule } from '../tas/tas.module';
import { TelegramService } from './telegram.service';

@Module({
  imports: [TasModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
