/**
 * Splits a long document into chunks of roughly `size` characters.
 *
 * Why chunk? The AI can't read a 50-page policy for every question (slow and expensive). We store
 * small pieces, search them, and give Claude only the few that match.
 *
 * Rules:
 *  - Prefer to break between paragraphs, then between sentences, so a chunk reads naturally.
 *  - Each chunk starts with the last `overlap` characters of the previous one. If an answer sits
 *    right at a boundary ("...notice period is" | "60 days..."), at least one chunk still has it whole.
 */
export function chunkText(text: string, size = 1000, overlap = 150): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = '';
  // true once `current` holds text that is NOT just the overlap copied from the previous chunk.
  // Stops us from saving a chunk that contains nothing but overlap.
  let hasNewText = false;

  for (const paragraph of paragraphs) {
    for (const piece of splitLongText(paragraph, size)) {
      if (hasNewText && current.length + piece.length + 2 > size) {
        chunks.push(current.trim());
        current = overlapTail(current, overlap);
        hasNewText = false;
      }
      current += (current ? '\n\n' : '') + piece;
      hasNewText = true;
    }
  }
  if (hasNewText) chunks.push(current.trim());

  return chunks;
}

/** A paragraph longer than `size` is cut into sentence groups (and, as a last resort, hard-cut). */
function splitLongText(text: string, size: number): string[] {
  if (text.length <= size) return [text];

  const pieces: string[] = [];
  let current = '';

  // (?<=[.!?])\s+ = split on the whitespace that follows a full stop / ! / ?
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    if (sentence.length > size) {
      // One giant "sentence" (e.g. a table with no full stops): cut it every `size` characters.
      if (current) pieces.push(current);
      current = '';
      for (let i = 0; i < sentence.length; i += size) pieces.push(sentence.slice(i, i + size));
    } else if (current && current.length + sentence.length + 1 > size) {
      pieces.push(current);
      current = sentence;
    } else {
      current += (current ? ' ' : '') + sentence;
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

/** The last `length` characters of `text`, trimmed so they start at a whole word. */
function overlapTail(text: string, length: number): string {
  const tail = text.slice(-length);
  const firstSpace = tail.indexOf(' ');
  return firstSpace >= 0 ? tail.slice(firstSpace + 1) : tail;
}
