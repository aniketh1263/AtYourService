import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { DocumentScope } from '../common/enums';
import { User } from '../users/user.entity';
import { DocumentChunk } from './document-chunk.entity';

/** An uploaded company policy file (PDF or Word). Its text is split into chunks for searching. */
@Entity('documents')
export class PolicyDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  filename!: string;

  @Column()
  mimeType!: string;

  // COMPANY = shared policy (agents upload). PERSONAL = one employee's own file, searched only for them.
  @Column({ type: 'enum', enum: DocumentScope, default: DocumentScope.COMPANY })
  scope!: DocumentScope;

  // Set for PERSONAL documents only. Deleting the user deletes their documents.
  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  owner!: Relation<User> | null;

  @CreateDateColumn()
  uploadedAt!: Date;

  @OneToMany(() => DocumentChunk, (chunk) => chunk.document)
  chunks!: Relation<DocumentChunk[]>;
}
