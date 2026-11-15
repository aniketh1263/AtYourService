import { z } from 'zod';
import { Intent, IssueCategory, TicketPriority } from '../common/enums';

// Reused by both schemas below so the allowed values are defined only once.
const priorityEnum = z.enum([
  TicketPriority.LOW,
  TicketPriority.MEDIUM,
  TicketPriority.HIGH,
  TicketPriority.CRITICAL,
]);

/**
 * The exact shape Claude must return. Zod turns this into a JSON schema that
 * constrains the model, so the output is always valid and typed.
 * The .describe() texts are read by Claude too, so they act as mini-instructions.
 */
export const ClassificationSchema = z.object({
  intent: z
    .enum([Intent.INCIDENT, Intent.REQUEST, Intent.INFO_ENQUIRY])
    .describe('What the employee wants: report a problem, ask for something, or ask a policy question.'),

  // "None" is used when the message is not an incident (e.g. a policy question has no IT category).
  category: z
    .enum([
      IssueCategory.HARDWARE,
      IssueCategory.SOFTWARE,
      IssueCategory.NETWORK,
      IssueCategory.ACCESS,
      'None',
    ])
    .describe('IT issue category. Use "None" if the intent is not an incident.'),

  priority: priorityEnum.describe('How urgent the issue is for the employee.'),

  summary: z.string().describe('One short sentence (max 15 words) summarising the message.'),
});

export type Classification = z.infer<typeof ClassificationSchema>;

/**
 * What Claude writes when an unresolved incident becomes a ticket.
 * Unlike the classification, the category can never be "None" here: a ticket always needs one.
 */
export const TicketDraftSchema = z.object({
  summary: z.string().describe('Ticket title: one line, max 12 words, specific (name the app/device and the symptom).'),
  description: z
    .string()
    .describe(
      'Plain-text description for the IT engineer: what is wrong, details the employee gave (app, device, error messages, when it started), and the troubleshooting steps already tried that did not work.',
    ),
  category: z.enum([
    IssueCategory.HARDWARE,
    IssueCategory.SOFTWARE,
    IssueCategory.NETWORK,
    IssueCategory.ACCESS,
  ]),
  priority: priorityEnum,
});

export type TicketDraft = z.infer<typeof TicketDraftSchema>;
