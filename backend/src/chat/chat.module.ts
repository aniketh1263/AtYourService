import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { ClassifierModule } from '../classifier/classifier.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { DocumentsModule } from '../documents/documents.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
import { TicketsModule } from '../tickets/tickets.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { IncidentHandler } from './handlers/incident.handler';
import { InfoHandler } from './handlers/info.handler';
import { RequestHandler } from './handlers/request.handler';

// The chat feature is built from the other features. Each import below gives ChatModule access
// to the services those modules export (LlmService comes from the @Global LlmModule).
@Module({
  imports: [
    ClassifierModule,
    ConversationsModule,
    TicketsModule,
    CatalogModule,
    KnowledgeBaseModule,
    DocumentsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, IncidentHandler, RequestHandler, InfoHandler],
})
export class ChatModule {}
