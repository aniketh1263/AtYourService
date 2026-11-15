// The AI writes links as plain text ("...apply here: https://portal.example/vpn"). This component
// turns every web address inside a text into a real, clickable link.

// The pattern: "http(s)://" + non-space characters, ending on a character that is not punctuation,
// so a full stop after the link ("...vpn.") does not become part of the link.
// The parentheses make split() keep the matched links in the result, at the ODD positions (1, 3, 5...).
const URL_PATTERN = /(https?:\/\/[^\s]*[^\s.,;:!?)])/g

export default function Linkify({ text }: { text: string }) {
  const parts = text.split(URL_PATTERN)

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <a
            key={index}
            href={part}
            target="_blank" // open in a new tab
            rel="noreferrer" // security: the new page gets no access to ours
            className="break-all font-medium text-blue-900 dark:text-blue-300 underline hover:text-blue-800 dark:hover:text-blue-200"
          >
            {part}
          </a>
        ) : (
          // Plain text between links. A fragment with a key lets React keep the list in order.
          <span key={index}>{part}</span>
        ),
      )}
    </>
  )
}
