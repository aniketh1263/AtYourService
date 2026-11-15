import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogItem } from './catalog-item.entity';

// Dummy catalog data. In a real company this would come from ServiceNow / Jira etc.
// The portal URLs are placeholders, as agreed for this project.
const SEED_ITEMS: Omit<CatalogItem, 'id'>[] = [
  {
    name: 'Laptop',
    category: 'Hardware',
    description: 'Request a new or replacement laptop (standard or developer spec).',
    portalUrl: 'https://portal.atyourservice.example/request/laptop',
  },
  {
    name: 'Monitor / Peripherals',
    category: 'Hardware',
    description: 'External monitor, keyboard, mouse or headset.',
    portalUrl: 'https://portal.atyourservice.example/request/peripherals',
  },
  {
    name: 'Microsoft Office 365',
    category: 'Software',
    description: 'Install or license Word, Excel, PowerPoint and Outlook.',
    portalUrl: 'https://portal.atyourservice.example/request/office365',
  },
  {
    name: 'Developer Tools (IDE, Docker)',
    category: 'Software',
    description: 'Request VS Code, JetBrains IDEs, Docker Desktop and similar tools.',
    portalUrl: 'https://portal.atyourservice.example/request/dev-tools',
  },
  {
    name: 'VPN Access',
    category: 'Access',
    description: 'Get access to the corporate VPN for remote work.',
    portalUrl: 'https://portal.atyourservice.example/request/vpn',
  },
  {
    name: 'Shared Drive / Folder Access',
    category: 'Access',
    description: 'Request access to a team shared folder or SharePoint site.',
    portalUrl: 'https://portal.atyourservice.example/request/shared-drive',
  },
];

@Injectable()
export class CatalogService implements OnModuleInit {
  constructor(
    @InjectRepository(CatalogItem)
    private readonly repo: Repository<CatalogItem>,
  ) {}

  // Runs once when the app starts: fills the table if it is empty, so the demo works out of the box.
  async onModuleInit() {
    if ((await this.repo.count()) === 0) {
      await this.repo.save(SEED_ITEMS);
    }
  }

  findAll() {
    return this.repo.find({ order: { category: 'ASC', name: 'ASC' } });
  }
}
