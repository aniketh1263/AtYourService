import type { Intent } from '../api/types'

// Human-friendly names for the intents the AI assigns. Shared by the chat bubbles and the history list.
export const intentLabel: Record<Intent, string> = {
  incident: 'IT issue',
  request: 'Service request',
  info_enquiry: 'Policy question',
}
