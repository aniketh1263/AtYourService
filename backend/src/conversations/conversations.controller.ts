import { Controller, Delete, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators';
import { ConversationsService } from './conversations.service';

// Backs the "History" page. Everyone (employee or agent) only ever sees their OWN conversations.
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  // GET /api/conversations      -> my past conversations
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.conversations.findAll(user.id);
  }

  // GET /api/conversations/:id  -> one of my conversations with all its messages
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.conversations.findOneWithMessages(id, user.id);
  }

  // DELETE /api/conversations/:id
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.conversations.remove(id, user.id);
  }
}
