import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Intent, MessageRole } from '../common/enums';
import type { ChatTurn } from '../llm/llm.service';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly repo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messages: Repository<Message>,
  ) {}

  // ---------- History page ----------

  // History page: MY conversations, newest first.
  findAll(userId: string) {
    return this.repo.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }

  // Opens one of MY past conversations with all its messages in chronological order.
  // Someone else's conversation gives the same 404 as one that does not exist, so ids cannot be probed.
  async findOneWithMessages(id: string, userId: string) {
    const conversation = await this.repo.findOne({
      where: { id, user: { id: userId } },
      relations: { messages: true },
      order: { messages: { createdAt: 'ASC' } },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async remove(id: string, userId: string) {
    // Load first: delete() cannot filter on a relation, and we must not delete someone else's chat.
    const owned = await this.repo.findOne({ where: { id, user: { id: userId } }, select: { id: true } });
    if (!owned) throw new NotFoundException('Conversation not found');
    await this.repo.delete(id);
    return { deleted: true };
  }

  // ---------- Used by the chat flow ----------

  /**
   * Continues an existing conversation, or starts a new one when no id is given.
   * A new conversation's title is the first 60 characters of the first message.
   */
  async startOrContinue(id: string | undefined, firstMessage: string, userId: string) {
    if (id) {
      const existing = await this.repo.findOne({ where: { id, user: { id: userId } } });
      if (!existing) throw new NotFoundException('Conversation not found');
      return existing;
    }
    return this.repo.save(
      this.repo.create({ title: firstMessage.slice(0, 60), user: { id: userId } }),
    );
  }

  addMessage(conversation: Conversation, role: MessageRole, content: string) {
    return this.messages.save(this.messages.create({ conversation, role, content }));
  }

  setIntent(id: string, intent: Intent) {
    return this.repo.update(id, { intent });
  }

  /**
   * The last `limit` messages of a conversation, oldest first, in the shape Claude expects.
   * We only send recent messages (not the whole history) to keep every call cheap and fast.
   */
  async recentTurns(conversationId: string, limit = 12): Promise<ChatTurn[]> {
    const rows = await this.messages.find({
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'DESC' }, // newest first so `take` keeps the latest ones...
      take: limit,
    });

    const turns: ChatTurn[] = rows.reverse().map((m) => ({ // ...then flip back to oldest first
      role: m.role === MessageRole.USER ? 'user' : 'assistant',
      content: m.content,
    }));

    // Claude requires a conversation to start with a user message; the cut-off point might land on a reply.
    while (turns.length > 0 && turns[0].role !== 'user') turns.shift();
    return turns;
  }
}
