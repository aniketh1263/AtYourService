type ErrorStateProps = {
  message: string
  onRetry?: () => void // optional: when given, a "Try again" button is shown
}

// Shown when loading data failed (for example the backend is stopped).
export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-950/50 p-6 text-center">
      <p className="text-sm font-medium text-red-800 dark:text-red-200">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg border border-red-300 dark:border-red-500/40 bg-surface px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 transition-colors hover:bg-red-100 dark:hover:bg-red-500/20"
        >
          Try again
        </button>
      )}
    </div>
  )
}
