import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser, Roles } from '../auth/decorators';
import { DocumentScope, UserRole } from '../common/enums';
import { DocumentsService } from './documents.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Backs the "Company policies" page. Only admins (agents) can upload or delete; employees can only read the list.
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  // POST /api/documents   (multipart/form-data, field name: "file")  - ADMINS ONLY
  // FileInterceptor (multer) reads the uploaded file into memory and hands it to us as `file`.
  // Files over 10 MB are rejected automatically with HTTP 413.
  @Roles(UserRole.AGENT)
  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }))
  upload(@UploadedFile() file: Express.Multer.File | undefined, @CurrentUser() user: AuthUser) {
    return this.documents.upload(file, user);
  }

  // GET /api/documents?scope=company|personal  -> documents with their chunk counts (default: company)
  @Get()
  list(@Query('scope') scope: string | undefined, @CurrentUser() user: AuthUser) {
    const wanted =
      scope === DocumentScope.PERSONAL ? DocumentScope.PERSONAL : DocumentScope.COMPANY;
    return this.documents.list(wanted, user);
  }

  // GET /api/documents/search?q=notice period  -> best matching chunks (handy for testing retrieval)
  // NOTE: declared before ":id" routes so "search" is never mistaken for an id.
  @Get('search')
  search(@Query('q') q = '', @CurrentUser() user: AuthUser) {
    return this.documents.search(q, user.id, 5);
  }

  // DELETE /api/documents/:id  - ADMINS ONLY
  @Roles(UserRole.AGENT)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.documents.remove(id, user);
  }
}
