import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Intent } from '../common/enums';
import { User } from '../users/user.entity';
import { Message } from './message.entity';

/**
 * One chat session. The History page lists these.
 * A conversation holds many messages (user + assistant turns).
 */
@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Short label for the history list; we set it from the user's first message.
  @Column({ default: 'New conversation' })
  title!: string;

  // What the AI decided this conversation is about (incident / request / info). Null until classified.
  @Column({ type: 'enum', enum: Intent, nullable: true })
  intent!: Intent | null;

  // Who owns this chat. Nullable only so conversations from before logins existed still load.
  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  user!: Relation<User> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Message, (message) => message.conversation)
  messages!: Relation<Message[]>;
}
