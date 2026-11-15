import { Controller, Get } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  // GET /api/catalog -> the full service catalog
  @Get()
  findAll() {
    return this.catalog.findAll();
  }
}
