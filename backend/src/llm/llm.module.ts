import { Global, Module } from '@nestjs/common';
import { LlmService } from './llm.service';

// @Global makes LlmService injectable in every module without re-importing LlmModule each time.
@Global()
@Module({
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}
