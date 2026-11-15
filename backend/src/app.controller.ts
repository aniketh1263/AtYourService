import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // GET /api/health  -> quick check that the server is up and the database is reachable.
  @Public()
  @Get('health')
  health() {
    return this.appService.health();
  }
}
