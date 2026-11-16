import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Not, Repository } from 'typeorm';
import { AuthUser } from '../auth/auth-user';
import { TicketPriority, TicketStatus, UserRole } from '../common/enums';
import { Conversation } from '../conversations/conversation.entity';
import { CreateTicketDto, ListTicketsQueryDto } from './dto/ticket.dto';
import { Ticket } from './ticket.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) private readonly repo: Repository<Ticket>,
    @InjectRepository(Conversation) private readonly conversations: Repository<Conversation>,
  ) {}

  /** Priority is for admins (agents) only: employees get tickets without the `priority` field. */
  forViewer<T extends Ticket | Ticket[]>(data: T, viewer: AuthUser): T {
    if (viewer.role === UserRole.AGENT) return data;
    const strip = (t: Ticket) => {
      const { priority: _priority, ...rest } = t;
      return rest as Ticket;
    };
    return (Array.isArray(data) ? data.map(strip) : strip(data as Ticket)) as T;
  }

  // The ticket belongs to the employee who raised it.
  async create(dto: CreateTicketDto, userId: string) {
    // A ticket may only be linked to one of the caller's own conversations.
    if (dto.conversationId) {
      const owned = await this.conversations.exists({
        where: { id: dto.conversationId, user: { id: userId } },
      });
      if (!owned) throw new NotFoundException('Conversation not found');
    }

    const ticket = this.repo.create({
      summary: dto.summary,
      description: dto.description,
      category: dto.category,
      priority: dto.priority,
      // status defaults to "Open" in the entity.
      // { id } is enough for TypeORM to set the foreign key without loading the whole row.
      conversation: dto.conversationId ? { id: dto.conversationId } : null,
      user: { id: userId },
    });
    return this.repo.save(ticket);
  }

  // Powers the dashboard: optional status filter + optional text search over summary/description.
  // Employees only get their own tickets; agents get everyone's (each with its requester's name).
  findAll({ search, status }: ListTicketsQueryDto, viewer: AuthUser) {
    const base: FindOptionsWhere<Ticket> = {
      ...(status ? { status } : {}),
      ...(viewer.role === UserRole.AGENT ? {} : { user: { id: viewer.id } }),
    };

    // Passing an array means OR: (summary matches) OR (description matches), each also filtered by status/owner.
    const where: FindOptionsWhere<Ticket>[] = search
      ? [
          { ...base, summary: ILike(`%${search}%`) },
          { ...base, description: ILike(`%${search}%`) },
        ]
      : [base];

    return this.repo.find({ where, relations: { user: true }, order: { createdAt: 'DESC' } });
  }

  /**
   * One ticket. Pass `viewer` from controllers so employees can only open their own (others get a 404);
   * internal callers (the chat) omit it because they already checked the conversation's owner.
   */
  async findOne(id: number, viewer?: AuthUser) {
    const ticket = await this.repo.findOne({ where: { id }, relations: { user: true } });
    const allowed =
      !viewer || viewer.role === UserRole.AGENT || ticket?.user?.id === viewer.id;
    if (!ticket || !allowed) throw new NotFoundException(`Ticket #${id} not found`);
    return ticket;
  }

  /**
   * The ticket of a conversation that is still being worked on (Open or In Progress), if any.
   * The chat uses it to (1) avoid creating two tickets for the same problem and
   * (2) mark the ticket Resolved when the employee says the problem is fixed.
   * A Resolved ticket is ignored on purpose: if the same problem returns later, a NEW ticket is allowed.
   */
  findActiveByConversation(conversationId: string) {
    return this.repo.findOne({
      where: { conversation: { id: conversationId }, status: Not(TicketStatus.RESOLVED) },
      order: { createdAt: 'DESC' }, // if there are several, take the latest
    });
  }

  // Admins (agents) only: called from PATCH /tickets/:id/priority.
  async updatePriority(id: number, priority: TicketPriority) {
    const ticket = await this.findOne(id);
    ticket.priority = priority;
    return this.repo.save(ticket);
  }

  async updateStatus(id: number, status: TicketStatus) {
    const ticket = await this.findOne(id);
    ticket.status = status;
    return this.repo.save(ticket);
  }
}
