// These types describe the JSON the backend sends us. They mirror the backend's entities and responses,
// so if we mistype a field name (ticket.priorty) the editor underlines it before we even run the app.
// They exist only at compile time: they add no code to the final app.

export type Intent = 'incident' | 'request' | 'info_enquiry'

export type IssueCategory = 'Hardware' | 'Software' | 'Network' | 'Access'
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved'

export type UserRole = 'employee' | 'agent'

/** A logged-in person. */
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

/** What login and register return. */
export interface AuthResponse {
  accessToken: string
  user: User
}

export interface Ticket {
  id: number
  summary: string
  description: string
  category: IssueCategory
  priority: TicketPriority
  status: TicketStatus
  createdAt: string // dates travel as text in JSON, e.g. "2026-11-14T09:30:00.000Z"
  updatedAt: string
  // Who raised it. Agents see it as the "requester"; null for tickets created before logins existed.
  user: Pick<User, 'id' | 'name' | 'email'> | null
}

export interface CatalogItem {
  id: number
  name: string
  category: string
  description: string
  portalUrl: string
}

/** What POST /api/chat returns for every message. */
export interface ChatResponse {
  conversationId: string
  intent: Intent
  reply: string
  offerTicket: boolean // true -> the fix failed, show a "Create ticket" button
  catalogItems: CatalogItem[] // request flow: matching catalog items
  sources: string[] // policy flow: names of the documents the answer came from
  ticket: Ticket | null // set when a ticket was created OR resolved in this turn (check ticket.status)
}

/** One row of the history list: GET /api/conversations. */
export interface ConversationSummary {
  id: string
  title: string // the first 60 characters of the first message
  intent: Intent | null // null until the AI has classified the conversation
  createdAt: string
}

/** One saved chat bubble, as stored in the database. */
export interface MessageRecord {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

/** One conversation with all its messages: GET /api/conversations/:id. */
export interface ConversationDetail extends ConversationSummary {
  messages: MessageRecord[]
}

/** company = shared policy uploaded by IT support. personal = one employee's own private file. */
export type DocumentScope = 'company' | 'personal'

/** One row of the document list: GET /api/documents. */
export interface DocumentRecord {
  id: string
  filename: string
  mimeType: string
  uploadedAt: string
  chunkCount: number // how many searchable sections the text was split into
}

/** What POST /api/documents returns after a successful upload. */
export interface UploadedDocument {
  id: string
  filename: string
  scope: DocumentScope
  chunkCount: number
  uploadedAt: string
}

/** What POST /api/chat/:id/ticket (the button) returns. */
export interface CreateTicketResponse {
  ticket: Ticket
  created: boolean // false when the conversation already had a ticket
  reply: string
}
