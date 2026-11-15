import type { MessageRecord } from '../../api/types'
import type { UiMessage } from './types'

// The database stores plain messages (role + text). The chat screen draws UiMessages.
// This converts one into the other, so saved conversations can be shown with the same bubbles.
// (Extras that only exist at the moment a reply is made, like catalog cards, are not stored, so an
// old conversation shows the text only.)
export function toUiMessage(record: MessageRecord): UiMessage {
  return { id: record.id, role: record.role, text: record.content }
}
