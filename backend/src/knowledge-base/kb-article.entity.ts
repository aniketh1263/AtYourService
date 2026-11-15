import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** One IT troubleshooting article. The incident flow searches these to suggest fixes. */
@Entity('kb_articles')
export class KbArticle {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  title!: string;

  // Same four categories as tickets: Hardware / Software / Network / Access.
  @Column()
  category!: string;

  // The step-by-step fix. This text is what gets searched and handed to Claude.
  @Column('text')
  content!: string;
}
