import { Avatar } from './MessageBubble'

// The three bouncing dots shown while we wait for the AI (a reply takes a few seconds).
// Without it the screen would look frozen after pressing Send.
export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 motion-safe:animate-fade-up">
      <Avatar />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-line bg-surface px-4 py-3.5 shadow-sm">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            // animate-bounce is a built-in Tailwind animation. Each dot starts a little later (the inline
            // style sets the delay), which creates the wave effect.
            className="h-2 w-2 animate-bounce rounded-full bg-blue-900/40 dark:bg-blue-300/50"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
        <span className="sr-only">The assistant is typing</span> {/* sr-only: read by screen readers, invisible */}
      </div>
    </div>
  )
}
