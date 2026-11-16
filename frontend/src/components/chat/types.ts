import type { CatalogItem, Intent, Ticket } from '../../api/types'

/**
 * One bubble in the chat window, in the shape the SCREEN needs.
 * It is deliberately separate from the API types: the backend does not send us a "message"
 * for each bubble, so we build these ourselves from what the user typed and what came back.
 */
export interface UiMessage {
  id: string // unique, so React can track each bubble
  role: 'user' | 'assistant'
  text: string
  imageUrl?: string // user only: a local preview of the screenshot they attached
  isError?: boolean // a red bubble for failures (e.g. backend down)
  intent?: Intent // assistant only: what the AI decided this was about
  catalogItems?: CatalogItem[] // assistant only: cards with portal links
  sources?: string[] // assistant only: documents a policy answer came from
  ticket?: Ticket | null // assistant only: a ticket created in this turn
  offerTicket?: boolean // assistant only: show a "Create ticket" button
}
