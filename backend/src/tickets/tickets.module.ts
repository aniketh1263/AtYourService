import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { Ticket } from './ticket.entity';
import { Conversation } from '../conversations/conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Conversation])],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService], // the chat module will create tickets through this
})
export class TicketsModule {}
