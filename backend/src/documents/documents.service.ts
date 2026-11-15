import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AuthUser } from '../auth/auth-user';
import { DocumentScope, UserRole } from '../common/enums';
import { buildOrTsQuery } from '../common/search-query';
import { DocumentChunk } from './document-chunk.entity';
import { PolicyDocument } from './document.entity';
import { cleanText, extractText } from './text-extractor';
import { chunkText } from './text-chunker';

// Each employee may keep this many personal documents (storage + search-noise limit).
export const MAX_PERSONAL_DOCUMENTS = 5;

/** A piece of a document that matched a search, plus the file it came from. */
export interface ChunkMatch {
  content: string;
  position: number;
  filename: string;
  scope: DocumentScope;
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(PolicyDocument) private readonly docs: Repository<PolicyDocument>,
  ) {}

  /**
   * Upload pipeline:  file -> extract text -> clean -> split into chunks -> save.
   * WHO uploads decides the scope (never the request): an agent's file becomes a shared COMPANY policy,
   * an employee's file becomes a PERSONAL document that only they can search.
   * Uploading a file with the same name (in the same scope/owner) REPLACES it.
   */
  async upload(file: Express.Multer.File | undefined, user: AuthUser) {
    if (!file) {
      throw new BadRequestException('No file received. Send it as multipart/form-data in a field named "file".');
    }
    const personal = user.role !== UserRole.AGENT;
    const scope = personal ? DocumentScope.PERSONAL : DocumentScope.COMPANY;
    // Which existing documents does this upload replace? Same name, same scope, same owner.
    const sameSlot: FindOptionsWhere<PolicyDocument> = personal
      ? { filename: file.originalname, scope, owner: { id: user.id } }
      : { filename: file.originalname, scope };

    // Do all the slow/fallible work BEFORE touching the database, so a bad file never deletes a good one.
    const text = cleanText(await extractText(file));
    if (text.length < 20) {
      throw new UnprocessableEntityException(
        'No readable text found in this file. If it is a scanned PDF (an image), it needs OCR first.',
      );
    }
    const chunks = chunkText(text);

    // A transaction = all-or-nothing: either the old version is replaced completely, or nothing changes.
    return this.docs.manager.transaction(async (db) => {
      const replaced = await db.find(PolicyDocument, { where: sameSlot, select: { id: true } });

      if (personal) {
        const mine = await db.count(PolicyDocument, { where: { scope, owner: { id: user.id } } });
        if (mine - replaced.length >= MAX_PERSONAL_DOCUMENTS) {
          throw new BadRequestException(
            `You can keep up to ${MAX_PERSONAL_DOCUMENTS} personal documents. Delete one first.`,
          );
        }
      }

      // Deleting the old document also deletes its chunks (the FK is ON DELETE CASCADE).
      if (replaced.length) await db.delete(PolicyDocument, replaced.map((d) => d.id));

      const document = await db.save(
        db.create(PolicyDocument, {
          filename: file.originalname,
          mimeType: file.mimetype,
          scope,
          owner: personal ? { id: user.id } : null,
        }),
      );
      await db.save(
        DocumentChunk,
        chunks.map((content, position) => ({ content, position, document })),
      );

      return {
        id: document.id,
        filename: document.filename,
        scope: document.scope,
        chunkCount: chunks.length,
        uploadedAt: document.uploadedAt,
      };
    });
  }

  /**
   * Upload page: documents of one kind with how many chunks each was split into.
   *   company  -> the shared policies (everyone may see the list)
   *   personal -> only the caller's own files
   */
  list(
    scope: DocumentScope,
    user: AuthUser,
  ): Promise<
    { id: string; filename: string; mimeType: string; uploadedAt: Date; chunkCount: number }[]
  > {
    const personal = scope === DocumentScope.PERSONAL;
    return this.docs.query(
      `SELECT d.id, d.filename, d."mimeType", d."uploadedAt", COUNT(c.id)::int AS "chunkCount"
         FROM documents d
         LEFT JOIN document_chunks c ON c."documentId" = d.id
        WHERE d.scope = $1 ${personal ? 'AND d."ownerId" = $2' : ''}
        GROUP BY d.id
        ORDER BY d."uploadedAt" DESC`,
      personal ? [scope, user.id] : [scope],
    );
  }

  /** How many documents this user can search: all company ones plus their own personal ones. */
  count(userId: string) {
    return this.docs.count({
      where: [{ scope: DocumentScope.COMPANY }, { owner: { id: userId } }],
    });
  }

  async remove(id: string, user: AuthUser) {
    const doc = await this.docs.findOne({ where: { id }, relations: { owner: true } });
    if (!doc) throw new NotFoundException('Document not found');

    if (doc.scope === DocumentScope.COMPANY) {
      if (user.role !== UserRole.AGENT) {
        throw new ForbiddenException('Only support agents can remove company documents');
      }
    } else if (doc.owner?.id !== user.id) {
      // Someone else's personal file: pretend it does not exist.
      throw new NotFoundException('Document not found');
    }

    await this.docs.delete(id); // chunks go too (cascade)
    return { deleted: true };
  }

  /**
   * Finds the chunks most relevant to a question (same full-text-search approach as the knowledge base).
   * Searches the shared COMPANY documents plus the caller's OWN personal ones, and nobody else's.
   * This is the "retrieval" step: the answer is generated later from ONLY these chunks.
   */
  async search(text: string, userId: string, limit = 4): Promise<ChunkMatch[]> {
    const query = buildOrTsQuery(text);
    if (!query) return [];

    return this.docs.query(
      `SELECT c.content, c.position, d.filename, d.scope
         FROM document_chunks c
         JOIN documents d ON d.id = c."documentId"
        WHERE (d.scope = 'company' OR d."ownerId" = $3)
          AND to_tsvector('english', c.content) @@ to_tsquery('english', $1)
        ORDER BY ts_rank(to_tsvector('english', c.content), to_tsquery('english', $1)) DESC
        LIMIT $2`,
      [query, limit, userId],
    );
  }
}
