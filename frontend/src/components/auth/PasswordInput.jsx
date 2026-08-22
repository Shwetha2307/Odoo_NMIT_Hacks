import { useId, useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

/**
 * Password field with a label, lock icon, and an accessible
 * show/hide toggle.
 */
export default function PasswordInput({
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  autoComplete = "current-password",
}) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  const errorId = useId();

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div
        className={`flex items-center rounded-lg border bg-white px-3 transition-colors focus-within:ring-2 focus-within:ring-flow focus-within:ring-offset-1 ${
          error ? "border-red-400" : "border-mist"
        }`}
      >
        <Lock className="h-4 w-4 flex-shrink-0 text-[#8A8578]" aria-hidden="true" />
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="w-full border-0 bg-transparent px-2.5 py-2.5 text-sm text-ink placeholder:text-[#8A8578] focus:outline-none focus:ring-0"
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="flex-shrink-0 rounded p-1 text-[#8A8578] transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-flow"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
