import { useTheme } from '../theme/useTheme'
import { MoonIcon, SunIcon } from './icons'

// A sliding light/dark switch. Note there is NO conditional logic for the look: Tailwind's `dark:` variant
// does it all in CSS. The knob slides with `dark:translate-x-8`, turns from sun-gold to moon-violet with
// `dark:from-...`, and the two icons swap with `dark:hidden` / `hidden dark:block`.
// `className` goes on a wrapper, so a parent can position the switch (e.g. "absolute right-4 top-4") without
// fighting the button's own "relative" (two position classes on one element: the stylesheet order decides, not us).
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { dark, toggle } = useTheme()

  return (
    <div className={className}>
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
      className="group relative block h-8 w-16 shrink-0 rounded-full border border-line-strong bg-surface-2 outline-none transition-colors hover:bg-surface-3 focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* the faint icons on the track hint at what the other side is */}
      <SunIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      <MoonIcon className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />

      {/* the knob */}
      <span className="absolute left-0.5 top-0.5 grid h-6 w-6 place-items-center rounded-full bg-amber-400 text-white shadow-md transition-all duration-300 ease-out group-active:scale-90 dark:translate-x-8 dark:bg-blue-700">
        <SunIcon className="h-3.5 w-3.5 dark:hidden" />
        <MoonIcon className="hidden h-3.5 w-3.5 dark:block" />
      </span>
    </button>
    </div>
  )
}
