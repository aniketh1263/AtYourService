import type { CatalogItem } from '../../catalog/catalog-item.entity';
import type { ChatTurn } from '../../llm/llm.service';
import type { TicketPriority } from '../../common/enums';
import type { Ticket } from '../../tickets/ticket.entity';

/** What a handler receives: the recent conversation, ending with the employee's latest message. */
export interface HandlerInput {
  turns: ChatTurn[];
  /** The conversation's open ticket (Open / In Progress), if one exists. Lets the AI know about it. */
  ticket?: Ticket | null;
  /** The logged-in employee: policy search includes THEIR personal documents. */
  userId: string;
}

/** What a handler gives back to ChatService. Only `reply` is mandatory. */
export interface HandlerOutput {
  reply: string;
  /** Incident only: the fix did not work, so the UI should offer a "Create ticket" button. */
  offerTicket?: boolean;
  /** Incident only: the employee asked for a ticket, so ChatService should create it now. */
  createTicket?: boolean;
  /** Incident only: the employee confirmed the problem is fixed, so ChatService should resolve the open ticket. */
  resolved?: boolean;
  /** Incident only: the employee asked to change the open ticket's priority, so ChatService should apply it. */
  newPriority?: TicketPriority;
  /** Request only: the catalog items matched, so the UI can show them as cards with portal links. */
  catalogItems?: CatalogItem[];
  /** Info only: names of the policy documents the answer was based on. */
  sources?: string[];
}

/**
 * The contract every intent handler follows. ChatService only knows this interface,
 * so adding a 4th intent later means adding one class, not changing the chat logic.
 */
export interface IntentHandler {
  handle(input: HandlerInput): Promise<HandlerOutput>;
}
