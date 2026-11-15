// Shared enums used by several modules (entities, DTOs, and later the AI prompts).
// Keeping them in one place guarantees the database, the API and the AI all use the same vocabulary.

/** The 3 things an employee can ask for (your flow). The AI classifies every message into one of these. */
export enum Intent {
  INCIDENT = 'incident', // something is broken, e.g. "Outlook not working"
  REQUEST = 'request', // asking for something, e.g. new software / hardware
  INFO_ENQUIRY = 'info_enquiry', // company policy question, e.g. "notice period?"
}

/** Who wrote a chat message. */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

/** Ticket lifecycle shown on the dashboard. */
export enum TicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
}

export enum TicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

/** Issue categories from the assignment (Hardware, Software, Network, Access). */
export enum IssueCategory {
  HARDWARE = 'Hardware',
  SOFTWARE = 'Software',
  NETWORK = 'Network',
  ACCESS = 'Access',
}

/** What a logged-in person is allowed to do. Employees use the assistant; agents run the IT desk. */
export enum UserRole {
  EMPLOYEE = 'employee',
  AGENT = 'agent',
}

/** COMPANY documents are uploaded by agents and searched for everyone. PERSONAL ones belong to one employee. */
export enum DocumentScope {
  COMPANY = 'company',
  PERSONAL = 'personal',
}
