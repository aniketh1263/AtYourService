// Remembers WHICH conversation the Chat page is currently on, so that leaving the page and coming back
// (or choosing "Continue this chat" in History) picks up where you left off.
//
// sessionStorage is a tiny key/value store in the browser that lasts until the tab is closed.
// Every call is wrapped in try/catch because browsers can block storage (private mode, strict settings);
// if that happens the app still works, it just forgets the conversation.

const KEY = 'atyourservice.activeConversation'

export function getActiveChat(): string | undefined {
  try {
    return sessionStorage.getItem(KEY) ?? undefined
  } catch {
    return undefined
  }
}

export function setActiveChat(conversationId: string) {
  try {
    sessionStorage.setItem(KEY, conversationId)
  } catch {
    // ignore: see note at the top
  }
}

export function clearActiveChat() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // ignore: see note at the top
  }
}
