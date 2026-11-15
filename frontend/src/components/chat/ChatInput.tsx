import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { SendIcon } from '../icons'

type ChatInputProps = {
  onSend: (text: string) => void // called with the text when the user sends
  disabled: boolean // true while we wait for the AI's reply
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  // The text being typed is only needed in THIS component, so it lives here as local state.
  // (Keeping state as close as possible to where it is used keeps the app simple.)
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null) // a direct handle on the <textarea> element

  function send() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('') // clear the box
  }

  // Runs when the form is submitted (the Send button, or pressing Enter inside a form).
  function handleSubmit(event: FormEvent) {
    event.preventDefault() // stop the browser's default behaviour of reloading the page
    send()
  }

  // Enter sends, Shift+Enter adds a new line (like most chat apps).
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // otherwise Enter would also insert a line break
      send()
    }
  }

  // When the AI finishes (disabled turns false), put the cursor back in the box so the user can type on.
  useEffect(() => {
    if (!disabled) textareaRef.current?.focus()
  }, [disabled])

  const canSend = !disabled && text.trim().length > 0

  return (
    <>
      {/* The rounded "pill" is the form; the textarea inside has no border of its own. focus-within: lights
          up the whole pill (border + soft glow ring) whenever the textarea has the cursor. */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 rounded-2xl border border-line-strong bg-surface p-2 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15"
      >
        <textarea
          ref={textareaRef}
          value={text} // a "controlled input": React state is the single source of truth for what is shown
          onChange={(event) => setText(event.target.value)} // every keystroke updates the state
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={2}
          maxLength={2000} // the backend rejects longer messages anyway
          placeholder="Describe your problem or ask a question..."
          className="max-h-40 min-h-[2.75rem] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          // enabled: solid navy that lifts a little on hover and presses in on click (active:scale-95).
          // disabled: flat and grey, no glow.
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-900 dark:bg-blue-900 text-white shadow-sm outline-none transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:scale-95 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-ink-faint disabled:shadow-none"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </form>
      <p className="mt-1.5 hidden text-center text-xs text-ink-faint sm:block">
        <kbd className="rounded border border-line-strong bg-surface-2 px-1 font-sans">Enter</kbd> to send
        {' · '}
        <kbd className="rounded border border-line-strong bg-surface-2 px-1 font-sans">Shift</kbd>
        {' + '}
        <kbd className="rounded border border-line-strong bg-surface-2 px-1 font-sans">Enter</kbd> for a new line
      </p>
    </>
  )
}
