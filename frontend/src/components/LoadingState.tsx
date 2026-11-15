// Shown while a page waits for data. A spinning ring (Tailwind's animate-spin) plus a short text.
export default function LoadingState({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-line bg-surface/80 p-8 text-sm text-ink-soft backdrop-blur">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-line-strong border-t-blue-500" />
      {text}
    </div>
  )
}
