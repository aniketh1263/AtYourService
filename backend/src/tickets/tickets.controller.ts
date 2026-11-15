import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser, Roles } from '../auth/decorators';
import { UserRole } from '../common/enums';
import {
  CreateTicketDto,
  ListTicketsQueryDto,
  UpdateTicketStatusDto,
} from './dto/ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  // POST /api/tickets            -> create a ticket (owned by the caller)
  @Post()
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: AuthUser) {
    return this.tickets.create(dto, user.id);
  }

  // GET /api/tickets?search=&status=  -> employees: my tickets. agents: all tickets.
  @Get()
  findAll(@Query() query: ListTicketsQueryDto, @CurrentUser() user: AuthUser) {
    return this.tickets.findAll(query, user);
  }

  // GET /api/tickets/:id         -> one ticket (employees: only their own)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.tickets.findOne(id, user);
  }

  // PATCH /api/tickets/:id/status -> move between Open / In Progress / Resolved. AGENTS ONLY.
  @Roles(UserRole.AGENT)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.tickets.updateStatus(id, dto.status);
  }
}
