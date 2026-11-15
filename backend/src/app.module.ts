import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogModule } from './catalog/catalog.module';
import { ChatModule } from './chat/chat.module';
import { ClassifierModule } from './classifier/classifier.module';
import { LlmModule } from './llm/llm.module';
import { ConversationsModule } from './conversations/conversations.module';
import { DocumentsModule } from './documents/documents.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    // Loads values from backend/.env and makes ConfigService available everywhere.
    ConfigModule.forRoot({ isGlobal: true }),

    // Connects NestJS to PostgreSQL through TypeORM.
    // forRootAsync is used so the connection settings are read from ConfigService (.env),
    // instead of being hard-coded.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        // Picks up every *.entity.ts file we create in later steps.
        autoLoadEntities: true,
        // Auto-creates/updates tables from our entities. Convenient for a demo project;
        // a production app would use migrations instead.
        synchronize: true,
      }),
    }),

    // General rate limit: 100 requests per minute per IP (login/register have a stricter one).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // Who can log in, and what they may do.
    UsersModule,
    AuthModule,

    // One module per feature, each with its own REST endpoints.
    LlmModule,
    ClassifierModule,
    CatalogModule,
    TicketsModule,
    ConversationsModule,
    DocumentsModule,
    KnowledgeBaseModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
