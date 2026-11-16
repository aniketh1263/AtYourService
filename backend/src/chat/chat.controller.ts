import { Body, Controller, Param, ParseUUIDPipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  // POST /api/chat  { "conversationId"?: "...", "message": "..." }
  // The main endpoint of the app: send a message, get the AI reply.
  // Optionally multipart with a screenshot in the "image" field (max 5 MB).
  @Post()
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: MAX_IMAGE_SIZE } }))
  send(
    @Body() dto: ChatDto,
    @UploadedFile() image: Express.Multer.File | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chat.chat(dto, user.id, image);
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
