import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ChatDto {
  // Omit on the first message; send back the id we returned to continue the same conversation.
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  // May be empty when a screenshot is attached; ChatService requires text OR an image.
  @IsOptional()
  @IsString()
  @MaxLength(2000) // keeps each AI call small and cheap
  message?: string;
}
