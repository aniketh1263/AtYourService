import { useEffect, useRef, useState } from 'react'
import type { ClipboardEvent, FormEvent, KeyboardEvent } from 'react'
import { ImageIcon, SendIcon } from '../icons'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

type ChatInputProps = {
  onSend: (text: string, image?: File) => void // called with the text (and screenshot, if any) when the user sends
  disabled: boolean // true while we wait for the AI's reply
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  // The text being typed is only needed in THIS component, so it lives here as local state.
  // (Keeping state as close as possible to where it is used keeps the app simple.)
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null) // the attached screenshot, if any
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null) // a direct handle on the <textarea> element

  // Check the file in the browser first (the server checks again): instant feedback, no wasted upload.
  function attach(file: File | undefined) {
    if (!file) return
    if (!IMAGE_TYPES.includes(file.type)) return setImageError('Please attach a PNG, JPG, WebP or GIF image.')
    if (file.size > MAX_IMAGE_BYTES) return setImageError('The image is too large (max 5 MB).')
    setImageError(null)
    setImage(file)
  }

  function clearImage() {
    setImage(null)
    setImageError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  // Show a small preview of the attached image, and free the browser memory when it changes.
  useEffect(() => {
    if (!image) return setPreviewUrl(null)
    const url = URL.createObjectURL(image)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  // Ctrl+V of a screenshot straight into the box.
  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const file = Array.from(event.clipboardData.files).find((f) => f.type.startsWith('image/'))
    if (file) {
      event.preventDefault()
      attach(file)
    }
  }

  function send() {
    const trimmed = text.trim()
    if ((!trimmed && !image) || disabled) return
    onSend(trimmed, image ?? undefined)
    setText('') // clear the box
    clearImage()
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

  const canSend = !disabled && (text.trim().length > 0 || !!image)

  return (
    <>
      {previewUrl && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-line bg-surface p-2 text-xs text-ink-soft">
          <img src={previewUrl} alt="Screenshot to send" className="h-12 w-12 rounded-lg object-cover" />
          <span className="min-w-0 flex-1 truncate">{image?.name ?? 'Screenshot'}</span>
          <button type="button" onClick={clearImage} className="rounded-lg px-2 py-1 hover:bg-surface-3">
            Remove
          </button>
        </div>
      )}
      {imageError && <p className="mb-2 text-xs text-red-700 dark:text-red-300">{imageError}</p>}
      {/* The rounded "pill" is the form; the textarea inside has no border of its own. focus-within: lights
          up the whole pill (border + soft glow ring) whenever the textarea has the cursor. */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 rounded-2xl border border-line-strong bg-surface p-2 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(event) => attach(event.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          aria-label="Attach a screenshot"
          title="Attach a screenshot"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink-soft transition-colors hover:bg-surface-3 disabled:opacity-50"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        <textarea
          ref={textareaRef}
          value={text} // a "controlled input": React state is the single source of truth for what is shown
          onChange={(event) => setText(event.target.value)} // every keystroke updates the state
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          rows={2}
          maxLength={2000} // the backend rejects longer messages anyway
          placeholder="Describe your problem, or attach a screenshot..."
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
        {' · '}Please don't include passwords in screenshots
      </p>
    </>
  )
}
