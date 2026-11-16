import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { IssueCategory, TicketPriority, TicketStatus } from '../../common/enums';
import { NormalizeEnum } from '../../common/normalize-enum';

// DTOs describe what a request body must look like. The global ValidationPipe
// (set in main.ts) rejects bad input with a clear 400 error before it reaches our code.

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  summary!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @NormalizeEnum(IssueCategory) // "software" -> "Software"
  @IsEnum(IssueCategory)
  category!: IssueCategory;

  @NormalizeEnum(TicketPriority) // "high" -> "High"
  @IsEnum(TicketPriority)
  priority!: TicketPriority;

  // Optional: which chat this ticket came from.
  @IsOptional()
  @IsUUID()
  conversationId?: string;
}

export class UpdateTicketStatusDto {
  @NormalizeEnum(TicketStatus) // "inprogress" / "in progress" -> "In Progress"
  @IsEnum(TicketStatus)
  status!: TicketStatus;
}

export class UpdateTicketPriorityDto {
  @NormalizeEnum(TicketPriority) // "high" -> "High"
  @IsEnum(TicketPriority)
  priority!: TicketPriority;
}

// Query string for GET /api/tickets?search=outlook&status=Open
export class ListTicketsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @NormalizeEnum(TicketStatus) // ?status=open works too
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
