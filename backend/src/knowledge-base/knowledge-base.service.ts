import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buildOrTsQuery } from '../common/search-query';
import { KbArticle } from './kb-article.entity';
import { KB_SEED } from './kb-articles.seed';

@Injectable()
export class KnowledgeBaseService implements OnModuleInit {
  constructor(
    @InjectRepository(KbArticle) private readonly repo: Repository<KbArticle>,
  ) {}

  // On start-up, fill the table with the starter articles if it is empty.
  async onModuleInit() {
    if ((await this.repo.count()) === 0) {
      await this.repo.save(KB_SEED);
    }
  }

  findAll() {
    return this.repo.find({ order: { category: 'ASC', title: 'ASC' } });
  }

  /**
   * Finds the articles most relevant to what the employee wrote.
   * Uses PostgreSQL full-text search:
   *   to_tsvector  = turns the article text into searchable word stems
   *   to_tsquery   = turns the employee's words into a search query
   *   @@           = "does this document match this query?"
   *   ts_rank      = a relevance score, so the best matches come first
   * This is the "Retrieval" in RAG: we fetch only a few relevant articles and give those to Claude.
   */
  async search(text: string, limit = 3): Promise<KbArticle[]> {
    const query = buildOrTsQuery(text);
    if (!query) return [];

    // $1 / $2 are query parameters (values are never glued into the SQL text -> no SQL injection).
    return this.repo.query(
      `SELECT id, title, category, content
         FROM kb_articles
        WHERE to_tsvector('english', title || ' ' || content) @@ to_tsquery('english', $1)
        ORDER BY ts_rank(to_tsvector('english', title || ' ' || content), to_tsquery('english', $1)) DESC
        LIMIT $2`,
      [query, limit],
    );
  }
}
