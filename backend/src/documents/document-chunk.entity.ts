import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PolicyDocument } from './document.entity';

/**
 * A small piece (~1000 characters) of a policy document.
 * Why chunks? We can't send a whole 50-page policy to the AI for every question.
 * Instead we search the chunks, and send only the few most relevant ones (this is "RAG").
 */
@Entity('document_chunks')
export class DocumentChunk {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => PolicyDocument, (doc) => doc.chunks, { onDelete: 'CASCADE' })
  document!: Relation<PolicyDocument>;

  @Column('text')
  content!: string;

  // Order of the chunk inside the original document.
  @Column()
  position!: number;
}
