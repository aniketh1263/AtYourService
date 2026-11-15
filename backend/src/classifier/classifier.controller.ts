import { Body, Controller, Post } from '@nestjs/common';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ClassifierService } from './classifier.service';

class ClassifyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000) // protects us from huge (expensive) inputs
  message!: string;
}

@Controller('classify')
export class ClassifierController {
  constructor(private readonly classifier: ClassifierService) {}

  // POST /api/classify  { "message": "Outlook keeps crashing" }
  // -> { intent, category, priority, summary }
  @Post()
  classify(@Body() dto: ClassifyDto) {
    return this.classifier.classify([{ role: 'user', content: dto.message }]);
  }
}
