import type { Intent } from '../api/types'
import { intentLabel } from '../utils/labels'

// Colour per intent. Full class names are written out so Tailwind can find them.
const style: Record<Intent, string> = {
  incident: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  request: 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300',
  info_enquiry: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300',
}

// A small coloured pill showing what kind of conversation this is.
export default function IntentBadge({ intent }: { intent: Intent }) {
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${style[intent]}`}>
      {intentLabel[intent]}
    </span>
  )
}
