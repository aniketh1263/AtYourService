import { Module } from '@nestjs/common';
import { ClassifierController } from './classifier.controller';
import { ClassifierService } from './classifier.service';

@Module({
  controllers: [ClassifierController],
  providers: [ClassifierService],
  exports: [ClassifierService], // the chat module will call this for every message
})
export class ClassifierModule {}
