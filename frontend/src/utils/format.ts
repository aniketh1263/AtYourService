/** "2026-11-14T09:30:00.000Z" -> "14 Nov 2026, 3:00 pm" (in the user's own language and time zone). */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}
