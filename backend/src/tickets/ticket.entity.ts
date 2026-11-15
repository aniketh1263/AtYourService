import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { IssueCategory, TicketPriority, TicketStatus } from '../common/enums';
import { Conversation } from '../conversations/conversation.entity';
import { User } from '../users/user.entity';

/** A support ticket, created when the AI could not solve an incident. */
@Entity('tickets')
export class Ticket {
  // Auto-incrementing number (1, 2, 3...) so tickets have a friendly id like "#12".
  @PrimaryGeneratedColumn('increment')
  id!: number;

  // One-line AI-generated summary, shown in the dashboard table.
  @Column()
  summary!: string;

  // Full description: what the user reported + what was already tried.
  @Column('text')
  description!: string;

  @Column({ type: 'enum', enum: IssueCategory })
  category!: IssueCategory;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority!: TicketPriority;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status!: TicketStatus;

  // Link back to the chat that produced this ticket (optional, SET NULL if the chat is deleted).
  @ManyToOne(() => Conversation, { nullable: true, onDelete: 'SET NULL' })
  conversation!: Relation<Conversation> | null;

  // The employee who raised it (agents see this as the "requester").
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user!: Relation<User> | null;

  @CreateDateColumn()
  createdAt!: Date;

  // Automatically refreshed by TypeORM every time the row changes (e.g. status moves to Resolved).
  @UpdateDateColumn()
  updatedAt!: Date;
}
