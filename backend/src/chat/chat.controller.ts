import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  // POST /api/chat  { "conversationId"?: "...", "message": "..." }
  // The main endpoint of the app: send a message, get the AI reply.
  @Post()
  send(@Body() dto: ChatDto, @CurrentUser() user: AuthUser) {
    return this.chat.chat(dto, user.id);
  }

  // POST /api/chat/:conversationId/ticket
  // Behind the "Create ticket" button: raises a ticket from the conversation.
  @Post(':conversationId/ticket')
  createTicket(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chat.createTicketFromButton(conversationId, user.id);
  }
}
