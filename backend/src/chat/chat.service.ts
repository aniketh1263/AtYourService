import { Injectable } from '@nestjs/common';
import { ClassifierService } from '../classifier/classifier.service';
import { Intent, MessageRole, TicketStatus } from '../common/enums';
import { ConversationsService } from '../conversations/conversations.service';
import { Ticket } from '../tickets/ticket.entity';
import { TicketsService } from '../tickets/tickets.service';
import { ChatDto } from './dto/chat.dto';
import { IncidentHandler } from './handlers/incident.handler';
import { InfoHandler } from './handlers/info.handler';
import { IntentHandler } from './handlers/intent-handler';
import { RequestHandler } from './handlers/request.handler';

/**
 * The brain of the chat. For every employee message it runs the same 4 steps:
 *   1. save the message   2. classify the conversation   3. let the right handler reply   4. save the reply
 */
@Injectable()
export class ChatService {
  // One handler per intent. Looking the handler up in this map replaces a long if / else chain.
  private readonly handlers: Record<Intent, IntentHandler>;

  constructor(
    private readonly conversations: ConversationsService,
    private readonly classifier: ClassifierService,
    private readonly tickets: TicketsService,
    incident: IncidentHandler,
    request: RequestHandler,
    info: InfoHandler,
  ) {
    this.handlers = {
      [Intent.INCIDENT]: incident,
      [Intent.REQUEST]: request,
      [Intent.INFO_ENQUIRY]: info,
    };
  }

  async chat(dto: ChatDto, userId: string) {
    // 1. Find or create the conversation (it must belong to this user), then store what they wrote.
    const conversation = await this.conversations.startOrContinue(dto.conversationId, dto.message, userId);
    await this.conversations.addMessage(conversation, MessageRole.USER, dto.message);

    // 2. Classify using the recent history, so short follow-ups ("yes", "still broken") keep their topic.
    const turns = await this.conversations.recentTurns(conversation.id);
    const { intent } = await this.classifier.classify(turns);
    await this.conversations.setIntent(conversation.id, intent);

    // 3. The matching handler produces the reply. It is told about the conversation's open ticket (if any),
    //    so the AI can say "ticket #5 is open" instead of offering a second one.
    const activeTicket = await this.tickets.findActiveByConversation(conversation.id);
    const result = await this.handlers[intent].handle({ turns, ticket: activeTicket, userId });
    let reply = result.reply;

    let ticket: Ticket | undefined;

    // The employee asked for a ticket in plain words, so create it now and tell them.
    if (result.createTicket) {
      const created = await this.createTicket(conversation.id, userId);
      ticket = created.ticket;
      reply += `\n\n${this.ticketMessage(created)}`;
    }

    // The employee says the problem is fixed and this conversation has an open ticket: close it.
    // (We only do this when the AI is confident: its "resolved" status needs a clear confirmation.)
    if (result.resolved && activeTicket) {
      ticket = await this.tickets.updateStatus(activeTicket.id, TicketStatus.RESOLVED);
      reply += `\n\nGood to hear it is working again. I've marked ticket #${ticket.id} as Resolved.`;
    }

    // The employee asked to change the ticket's urgency ("make it high"): apply it to the open ticket.
    if (result.newPriority && activeTicket && result.newPriority !== activeTicket.priority) {
      const oldPriority = activeTicket.priority;
      ticket = await this.tickets.updatePriority(activeTicket.id, result.newPriority);
      // Our own factual message replaces Claude's sentence, so the reply is not said twice.
      reply =
        `I've updated the priority of ticket #${ticket.id}.\n\n` +
        `Summary: ${ticket.summary}\n` +
        `Priority: ${oldPriority} → ${ticket.priority}\n` +
        `Status: ${ticket.status}\n` +
        `Category: ${ticket.category}`;
    }

    // 4. Store the reply so it shows up in History.
    await this.conversations.addMessage(conversation, MessageRole.ASSISTANT, reply);

    return {
      conversationId: conversation.id,
      intent,
      reply,
      // UI shows a "Create ticket" button when true. Never offered when a ticket is already open.
      offerTicket: (result.offerTicket ?? false) && !activeTicket,
      catalogItems: result.catalogItems ?? [], // UI shows catalog cards (with portal links)
      sources: result.sources ?? [], // UI shows "Source: HR Policy.pdf" under policy answers
      ticket: ticket ?? null, // set when a ticket was created OR resolved in this turn
    };
  }

  /**
   * Creates a ticket from a conversation: Claude writes the summary, description, category and priority.
   * Safe to call twice: if the conversation already has an OPEN ticket, that one is returned instead of a duplicate.
   */
  async createTicket(conversationId: string, userId: string) {
    // Ownership check first: throws a 404 if the conversation does not exist OR belongs to someone else.
    await this.conversations.findOneWithMessages(conversationId, userId);

    const existing = await this.tickets.findActiveByConversation(conversationId);
    if (existing) return { ticket: existing, created: false };

    const turns = await this.conversations.recentTurns(conversationId, 20);
    const draft = await this.classifier.draftTicket(turns);

    const ticket = await this.tickets.create({ ...draft, conversationId }, userId);
    return { ticket, created: true };
  }

  /** Used by the "Create ticket" button endpoint: creates the ticket AND records it in the chat. */
  async createTicketFromButton(conversationId: string, userId: string) {
    const result = await this.createTicket(conversationId, userId);
    const reply = this.ticketMessage(result);

    if (result.created) {
      const conversation = await this.conversations.findOneWithMessages(conversationId, userId);
      await this.conversations.addMessage(conversation, MessageRole.ASSISTANT, reply);
    }
    return { ...result, reply };
  }

  private ticketMessage({ ticket, created }: { ticket: Ticket; created: boolean }) {
    return created
      ? `I've raised ticket #${ticket.id}: "${ticket.summary}" (priority: ${ticket.priority}). The IT team will pick it up, and you can follow its status on the Tickets page.`
      : `Ticket #${ticket.id} already exists for this conversation ("${ticket.summary}", status: ${ticket.status}).`;
  }
}
