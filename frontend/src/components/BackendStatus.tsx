import { useEffect, useState } from 'react'

// The three things this indicator can show. A "union type": a variable of this type can only
// ever hold one of these exact strings, so a typo like 'ofline' becomes a compile error.
type Status = 'checking' | 'online' | 'offline'

// Small description for each status: the text to show and the colour of the dot.
const display: Record<Status, { label: string; dot: string }> = {
  checking: { label: 'Checking server...', dot: 'bg-amber-400' },
  online: { label: 'Server online', dot: 'bg-emerald-500' },
  offline: { label: 'Server offline', dot: 'bg-red-500' },
}

export default function BackendStatus() {
  // STATE: data that, when it changes, makes React redraw the component.
  // useState returns [currentValue, functionToChangeIt]. We start in the 'checking' state.
  const [status, setStatus] = useState<Status>('checking')

  // EFFECT: code that must run *outside* of drawing, here "talk to the server".
  // The empty [] at the end means "run once, when the component first appears".
  useEffect(() => {
    async function check() {
      try {
        // "/api/health" is a relative URL, Vite's proxy forwards it to the NestJS backend.
        const response = await fetch('/api/health')
        setStatus(response.ok ? 'online' : 'offline')
      } catch {
        // fetch throws when the server cannot be reached at all
        setStatus('offline')
      }
    }

    check() // once immediately...
    const timer = setInterval(check, 15000) // ...and then every 15 seconds

    // CLEANUP: React runs this function when the component disappears, so we stop the timer
    // and do not leave it running forever in the background.
    return () => clearInterval(timer)
  }, [])

  const { label, dot } = display[status]

  return (
    <div className="flex items-center gap-2 text-xs text-ink-soft">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </div>
  )
}
