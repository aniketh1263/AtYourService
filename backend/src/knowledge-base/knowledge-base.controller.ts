import { Controller, Get, Query } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly kb: KnowledgeBaseService) {}

  // GET /api/knowledge-base            -> all articles
  // GET /api/knowledge-base?search=vpn -> the most relevant articles (handy to test the search itself)
  @Get()
  find(@Query('search') search?: string) {
    return search ? this.kb.search(search, 5) : this.kb.findAll();
  }
}
