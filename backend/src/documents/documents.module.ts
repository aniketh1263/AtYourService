import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentChunk } from './document-chunk.entity';
import { PolicyDocument } from './document.entity';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyDocument, DocumentChunk])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService], // the chat's info handler searches policy chunks with this
})
export class DocumentsModule {}
