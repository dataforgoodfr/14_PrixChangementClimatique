import { AlertCircle } from "lucide-react"

interface ErrorMessageProps {
  error?: Error | string
  title?: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({
  error,
  title = "Une erreur est survenue",
  onRetry,
  className = "",
}: ErrorMessageProps) {
  const errorMessage = typeof error === "string" ? error : error?.message

  return (
    <div
      className={`p-4 bg-red-50 border border-red-200 rounded-md ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">{title}</h3>
          {errorMessage && (
            <p className="text-sm text-red-700">{errorMessage}</p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm text-red-700 underline hover:text-red-900 transition-colors"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
