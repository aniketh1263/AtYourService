import { Transform } from 'class-transformer';

// "In Progress", "in-progress", "IN_PROGRESS" and "inprogress" all become "inprogress".
const simplify = (text: string) => text.toLowerCase().replace(/[\s_-]+/g, '');

/**
 * DTO decorator that makes an enum field forgiving about how it is typed.
 * It converts whatever the caller sent into the exact enum value ("open" -> "Open")
 * BEFORE the @IsEnum validation runs.
 *
 * If nothing matches we return the value untouched, so @IsEnum still rejects it
 * with its normal "must be one of the following values" error message.
 *
 * Usage:  @NormalizeEnum(TicketStatus) @IsEnum(TicketStatus) status!: TicketStatus;
 */
export function NormalizeEnum(enumObject: Record<string, string>) {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const match = Object.values(enumObject).find(
      (candidate) => simplify(candidate) === simplify(value),
    );
    return match ?? value;
  });
}
