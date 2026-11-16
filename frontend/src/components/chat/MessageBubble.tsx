import type { Intent } from '../../api/types'
import { SparkleIcon } from '../icons'
import CatalogCard from './CatalogCard'
import Linkify from './Linkify'
import TicketCard from './TicketCard'
import type { UiMessage } from './types'

// A small label under assistant replies, so the user can see how the AI understood the message.
const intentLabel: Record<Intent, string> = {
  incident: 'IT issue',
  request: 'Service request',
  info_enquiry: 'Policy question',
}

// The round navy badge next to every assistant message (also used by the typing indicator).
export function Avatar() {
  return (
    <span className="mb-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-900 dark:bg-blue-900 text-white shadow-md">
      <SparkleIcon className="h-4 w-4" />
    </span>
  )
}

type MessageBubbleProps = {
  message: UiMessage
  showTicketButton: boolean // true only for the latest reply, when the AI offered a ticket
  ticketLoading: boolean // true while the ticket is being created
  onCreateTicket: () => void // a function passed down from the page, called when the button is clicked
}

export default function MessageBubble({
  message,
  showTicketButton,
  ticketLoading,
  onCreateTicket,
}: MessageBubbleProps) {
  // The employee's own messages: a simple bubble on the right.
  if (message.role === 'user') {
    return (
      // motion-safe:animate-fade-up = the bubble slides up and fades in (our animation from index.css),
      // but only for people who have not asked their device to reduce motion.
      <div className="flex flex-col items-end gap-1 motion-safe:animate-fade-up">
        {message.imageUrl && (
          <img src={message.imageUrl} alt="Attached screenshot" className="max-h-48 max-w-[85%] rounded-xl border border-line shadow-sm" />
        )}
        {message.text && (
          <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-blue-900 dark:bg-blue-900 px-4 py-2.5 text-sm text-white shadow-sm">
            {message.text}
          </p>
        )}
      </div>
    )
  }

  // The assistant's replies: a bubble on the left, plus optional extras underneath.
  return (
    <div className="flex items-end justify-start gap-2 motion-safe:animate-fade-up">
      <Avatar />
      <div
        className={`min-w-0 max-w-[85%] space-y-3 rounded-2xl rounded-bl-sm border px-4 py-3 text-sm shadow-sm ${
          message.isError ? 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200' : 'border-line bg-surface'
        }`}
      >
        {/* whitespace-pre-wrap keeps the AI's line breaks (numbered steps) instead of squashing them. */}
        <p className="whitespace-pre-wrap">
          <Linkify text={message.text} />
        </p>

        {/* "&&" draws the block only when the condition before it is true / not empty. */}
        {message.catalogItems && message.catalogItems.length > 0 && (
          <div className="space-y-2">
            {message.catalogItems.map((item) => (
              <CatalogCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {message.ticket && <TicketCard ticket={message.ticket} />}

        {showTicketButton && (
          <button
            type="button"
            onClick={onCreateTicket}
            disabled={ticketLoading}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {ticketLoading ? 'Creating ticket...' : 'Create a support ticket'}
          </button>
        )}

        {message.sources && message.sources.length > 0 && (
          <p className="text-xs text-ink-soft">Source: {message.sources.join(', ')}</p>
        )}

        {message.intent && <p className="text-xs text-ink-faint">{intentLabel[message.intent]}</p>}
      </div>
    </div>
  )
}
