import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { MessageRole } from '../common/enums';
import { Conversation } from './conversation.entity';

/** A single chat bubble (either from the employee or from the AI). */
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // onDelete CASCADE: deleting a conversation also deletes its messages.
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  conversation!: Relation<Conversation>;

  @Column({ type: 'enum', enum: MessageRole })
  role!: MessageRole;

  @Column('text')
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
