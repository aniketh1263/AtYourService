import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../api/client'
import { createTicketFromChat, sendMessage } from '../api/chat'
import { getConversation } from '../api/conversations'
import type { ConversationDetail } from '../api/types'
import ChatInput from '../components/chat/ChatInput'
import MessageBubble from '../components/chat/MessageBubble'
import { toUiMessage } from '../components/chat/mappers'
import TypingIndicator from '../components/chat/TypingIndicator'
import type { UiMessage } from '../components/chat/types'
import { ArrowRightIcon, SparkleIcon } from '../components/icons'
import LoadingState from '../components/LoadingState'
import { useApi } from '../hooks/useApi'
import { clearActiveChat, getActiveChat, setActiveChat } from '../utils/activeChat'

// Clickable examples for an empty chat, so a new user instantly sees what to try.
const SUGGESTIONS = [
  'My Outlook keeps crashing',
  'I need a new laptop',
  'What is the notice period?',
  'My VPN will not connect',
]

// Turns any thrown error into text for a red bubble.
function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
}

export default function ChatPage() {
  // The page's STATE. Whenever one of these changes, React redraws the page.
  const [messages, setMessages] = useState<UiMessage[]>([]) // everything shown in the chat
  const [conversationId, setConversationId] = useState<string | undefined>() // set after the first reply
  const [loading, setLoading] = useState(false) // waiting for the AI?
  const [ticketLoading, setTicketLoading] = useState(false) // creating a ticket?

  // ---- Picking up where we left off ----
  // Components are destroyed when you leave their page, which would wipe the chat. So we remember the
  // conversation id in the browser (utils/activeChat.ts) and reload that conversation when we come back.
  // useState(getActiveChat) calls the function ONCE, when the page first opens.
  const [resumeId] = useState(getActiveChat)
  const resumed = useApi<ConversationDetail | null>(
    () => (resumeId ? getConversation(resumeId) : Promise.resolve(null)), // nothing to resume -> no request
    [resumeId],
  )

  // When the saved conversation arrives, put its messages on screen and continue using its id.
  useEffect(() => {
    if (resumed.data) {
      setConversationId(resumed.data.id)
      setMessages(resumed.data.messages.map(toUiMessage))
    }
  }, [resumed.data])

  // If that conversation no longer exists (e.g. deleted), forget it and simply start a fresh chat.
  useEffect(() => {
    if (resumed.error) clearActiveChat()
  }, [resumed.error])

  // ---- Keeping the newest message in view ----
  // The message list is its own scroll box (see the JSX). We scroll THAT box by setting its scrollTop.
  //
  // This replaces an older version that called scrollIntoView({ behavior: 'smooth' }) on an element at the
  // bottom of the page, which caused the "scroll jumps up and down" bug in long chats:
  //   1. scrollIntoView scrolls EVERY scrollable parent, not just the chat, so the whole page was dragged around;
  //   2. a reply changes "messages" and "loading" in two separate renders, so two smooth scrolls started a
  //      moment apart and fought each other;
  //   3. it ran even when you had scrolled up to read an old message, yanking you back down.
  const scrollRef = useRef<HTMLDivElement>(null)
  // "Is the user looking at the newest messages?" A ref, not state: changing it must not redraw the page.
  const stickToBottom = useRef(true)

  // Runs on every scroll of the message box. Within 80px of the bottom counts as "at the bottom".
  function handleScroll() {
    const box = scrollRef.current
    if (!box) return
    stickToBottom.current = box.scrollHeight - box.scrollTop - box.clientHeight < 80
  }

  // After every change to the chat, jump to the bottom - but only if the user was already there.
  // (No smooth animation on purpose: the new bubble fades in by itself, and an instant jump cannot
  // collide with the next one.)
  useEffect(() => {
    const box = scrollRef.current
    if (box && stickToBottom.current) box.scrollTop = box.scrollHeight
  }, [messages, loading])

  // Sends the employee's text to the AI and adds both sides to the chat.
  async function handleSend(text: string, image?: File) {
    stickToBottom.current = true // sending a message always brings you back to the bottom
    // 1. Show the user's bubble immediately, without waiting for the server.
    // setMessages(previous => ...) is the safe way to add to a list: it always starts from the latest list.
    setMessages((previous) => [
      ...previous,
      { id: crypto.randomUUID(), role: 'user', text, imageUrl: image ? URL.createObjectURL(image) : undefined },
    ])
    setLoading(true)

    try {
      // 2. Ask the backend. "await" pauses this function (not the whole page) until the reply arrives.
      const response = await sendMessage(text, conversationId, image)

      // 3. Remember the conversation so the next message continues it, and show the reply.
      setConversationId(response.conversationId)
      setActiveChat(response.conversationId) // also remember it in the browser, for when we come back
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: response.reply,
          intent: response.intent,
          catalogItems: response.catalogItems,
          sources: response.sources,
          ticket: response.ticket,
          offerTicket: response.offerTicket,
        },
      ])
    } catch (error) {
      // 4. On failure, show a red bubble instead of silently doing nothing.
      setMessages((previous) => [
        ...previous,
        { id: crypto.randomUUID(), role: 'assistant', text: errorText(error), isError: true },
      ])
    } finally {
      setLoading(false) // runs whether it worked or failed
    }
  }

  // The "Create a support ticket" button.
  async function handleCreateTicket() {
    if (!conversationId) return
    setTicketLoading(true)
    try {
      const response = await createTicketFromChat(conversationId)
      setMessages((previous) => [
        ...previous,
        { id: crypto.randomUUID(), role: 'assistant', text: response.reply, ticket: response.ticket },
      ])
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        { id: crypto.randomUUID(), role: 'assistant', text: errorText(error), isError: true },
      ])
    } finally {
      setTicketLoading(false)
    }
  }

  // Start over: forget the conversation, so the next message begins a brand-new one.
  function handleNewChat() {
    stickToBottom.current = true
    setMessages([])
    setConversationId(undefined)
    clearActiveChat()
  }

  // The ticket button belongs to the latest message only, and only if the AI offered one.
  const lastMessage = messages[messages.length - 1]

  // True while we are reloading a remembered conversation.
  const restoring = resumed.loading

  return (
    // min-h-0 + flex-1: this page is exactly as tall as the space the layout gives it, no taller. Without
    // min-h-0 a flex child refuses to shrink below its content and the whole page would scroll instead.
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Chat</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Describe an IT problem, ask for something, or ask a policy question.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleNewChat}
            disabled={loading}
            className="shrink-0 rounded-xl border border-line-strong bg-surface px-3.5 py-1.5 text-sm font-medium text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            New chat
          </button>
        )}
      </header>

      {/* THE SCROLL BOX. flex-1 = take all the free height; min-h-0 + overflow-y-auto = scroll inside it.
          overscroll-contain stops a scroll that reaches the end from "chaining" to the page behind.
          [scrollbar-gutter:stable] reserves the scrollbar's width, so bubbles never shift sideways when it appears. */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-4 pr-1 [scrollbar-gutter:stable]"
      >
        {restoring ? (
          <LoadingState text="Loading your conversation..." />
        ) : messages.length === 0 ? (
          // Empty state: a welcome and clickable examples.
          <div className="mx-auto flex max-w-2xl flex-col items-center px-2 pt-6 text-center motion-safe:animate-fade-up sm:pt-12">
            <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-blue-900 dark:bg-blue-900 text-white shadow-sm">
              <SparkleIcon className="h-8 w-8" />
            </span>
            <h3 className="text-3xl font-bold tracking-tight text-ink">Hi, how can I help?</h3>
            <p className="mt-2 text-sm text-ink-soft">Pick an example to get started, or type your own below.</p>

            <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  disabled={loading}
                  // animationDelay (inline) staggers the cards so they appear one after another.
                  // "group" lets the arrow react when the WHOLE card is hovered (group-hover:...).
                  style={{ animationDelay: `${index * 70}ms` }}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface/80 px-4 py-3.5 text-left text-sm font-medium shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-md active:translate-y-0 disabled:opacity-50 motion-safe:animate-fade-up"
                >
                  {suggestion}
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-faint transition-all duration-200 group-hover:translate-x-1 group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              showTicketButton={
                message === lastMessage && !!message.offerTicket && !message.ticket && !loading
              }
              ticketLoading={ticketLoading}
              onCreateTicket={handleCreateTicket}
            />
          ))
        )}

        {loading && <TypingIndicator />}
      </div>

      {/* The input is NOT sticky any more: it is simply the last item of the page's column, under the
          scroll box, so it cannot overlap or be pushed around by the messages. */}
      <div className="shrink-0 pt-2">
        <ChatInput onSend={handleSend} disabled={loading || restoring} />
      </div>
    </div>
  )
}
