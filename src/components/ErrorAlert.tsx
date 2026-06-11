import { AlertCircle } from "lucide-react";

/**
 * Standard error banner used across all tools so failures look the same
 * everywhere. Renders nothing when there is no message.
 */
export function ErrorAlert({ message, className = "" }: { message?: string | null; className?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm ${className}`}
    >
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
