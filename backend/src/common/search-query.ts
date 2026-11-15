/**
 * Turns a natural sentence into a PostgreSQL full-text-search query with OR between words.
 *
 *   "My Outlook keeps crashing!"  ->  "my | outlook | keeps | crashing"
 *
 * Why OR and not AND? People write whole sentences. With AND, an article would have to contain
 * EVERY word of the sentence to match. With OR, any shared word matches, and Postgres's ts_rank
 * puts the articles sharing the most (and rarest) words first.
 *
 * Postgres itself drops stop-words ("my", "not"...) and stems words ("crashing" -> "crash").
 * Because we keep only letters and digits, the result can never break tsquery syntax
 * (so user input can't cause SQL/tsquery errors).
 *
 * Returns '' when nothing usable is left, so callers can skip the search.
 */
export function buildOrTsQuery(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // drop punctuation / special characters
    .split(/\s+/)
    .filter((word) => word.length >= 2);

  return [...new Set(words)].join(' | '); // Set removes duplicate words
}
