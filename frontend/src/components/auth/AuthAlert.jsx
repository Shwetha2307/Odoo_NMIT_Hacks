import { AlertCircle } from "lucide-react";

/**
 * Accessible inline alert for authentication errors.
 * Uses an icon + text (not color alone) to communicate the error state.
 */
export default function AuthAlert({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
