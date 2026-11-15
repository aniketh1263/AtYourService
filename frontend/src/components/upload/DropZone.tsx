import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react'
import { MAX_FILE_SIZE_MB } from '../../utils/files'

type DropZoneProps = {
  onFiles: (files: File[]) => void // called with the chosen files (from dropping OR browsing)
  disabled: boolean // true while an upload is running
}

// A big dashed box. You can drop files on it, or click it to open the normal file picker.
export default function DropZone({ onFiles, disabled }: DropZoneProps) {
  // true while the user is dragging a file over the box: used to highlight it.
  const [dragging, setDragging] = useState(false)
  // A handle on the hidden <input type="file">. Clicking the box "clicks" that input for us.
  const inputRef = useRef<HTMLInputElement>(null)

  // Drag events fire in this order: dragover (repeatedly) -> drop, or dragleave if the user changes their mind.
  function handleDragOver(event: DragEvent) {
    event.preventDefault() // REQUIRED: by default browsers refuse drops. Cancelling the event allows it.
    if (!disabled) setDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    // dragleave also fires when the pointer moves onto a CHILD element (the text inside the box), which
    // would make the highlight flicker. relatedTarget is where the pointer went: ignore it if still inside.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    setDragging(false)
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault() // otherwise the browser would open the dropped file in the tab
    setDragging(false)
    if (!disabled) onFiles(Array.from(event.dataTransfer.files))
  }

  // Called when files are chosen through the file picker.
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    onFiles(Array.from(event.target.files ?? []))
    // Clear the input: otherwise choosing the SAME file twice in a row would not trigger a change event.
    event.target.value = ''
  }

  // Keyboard accessibility: Enter or Space opens the picker, just like clicking.
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <div
      role="button" // tells screen readers this box acts like a button
      tabIndex={disabled ? -1 : 0} // reachable with the Tab key
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
        disabled
          ? 'cursor-not-allowed border-line bg-surface-3 text-ink-faint'
          : dragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200'
            : 'border-line-strong bg-surface text-ink-soft hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-500/10'
      }`}
    >
      <p className="font-medium">{dragging ? 'Drop to upload' : 'Drag and drop files here, or click to browse'}</p>
      <p className="mt-1 text-sm">PDF or Word (.docx), up to {MAX_FILE_SIZE_MB} MB each</p>

      {/* The real file input is hidden; the box above is the pretty version of it. */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx" // the picker only shows these types (a hint, not enforcement)
        multiple // allow choosing several files at once
        onChange={handleInputChange}
        className="hidden"
        tabIndex={-1}
      />
    </div>
  )
}
