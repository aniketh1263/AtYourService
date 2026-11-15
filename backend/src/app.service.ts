import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  // DataSource is TypeORM's live database connection.
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async health() {
    // Runs a trivial query; if it succeeds, the DB connection is working.
    await this.db.query('SELECT 1');
    return { status: 'ok', database: 'connected' };
  }
}
