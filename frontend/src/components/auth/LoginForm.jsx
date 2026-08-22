import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Loader2 } from "lucide-react";
import PasswordInput from "./PasswordInput.jsx";
import AuthAlert from "./AuthAlert.jsx";
import { login, getDashboardRouteForRole, AuthError } from "../../services/authService.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }) {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Password must contain at least 6 characters.";
  }

  return errors;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const emailId = useId();
  const emailErrorId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const errors = validate({ email, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { user } = await login(email.trim(), password);
      navigate(getDashboardRouteForRole(user.role));
    } catch (error) {
      if (error instanceof AuthError) {
        setFormError(error.message);
      } else {
        setFormError("Unable to connect to the server. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleForgotPassword(event) {
    event.preventDefault();
    setShowForgotNotice(true);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <AuthAlert message={formError} />

      <div>
        <label htmlFor={emailId} className="mb-1.5 block text-sm font-medium text-ink">
          Email address
        </label>
        <div
          className={`flex items-center rounded-lg border bg-white px-3 transition-colors focus-within:ring-2 focus-within:ring-flow focus-within:ring-offset-1 ${
            fieldErrors.email ? "border-red-400" : "border-mist"
          }`}
        >
          <Mail className="h-4 w-4 flex-shrink-0 text-[#8A8578]" aria-hidden="true" />
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? emailErrorId : undefined}
            className="w-full border-0 bg-transparent px-2.5 py-2.5 text-sm text-ink placeholder:text-[#8A8578] focus:outline-none focus:ring-0"
          />
        </div>
        {fieldErrors.email && (
          <p id={emailErrorId} className="mt-1.5 text-xs font-medium text-red-600">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <PasswordInput
        label="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter your password"
        error={fieldErrors.password}
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-[#4A4638]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border-mist text-tide focus:ring-flow"
          />
          Remember me
        </label>

        <a
          href="#"
          onClick={handleForgotPassword}
          className="font-medium text-tide hover:text-ink focus:outline-none focus-visible:underline"
        >
          Forgot password?
        </a>
      </div>

      {showForgotNotice && (
        <p role="status" className="text-xs text-[#8A8578]">
          Password reset is coming soon. Please contact your HR administrator
          for now.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-flow px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-[#cf8f30] focus:outline-none focus-visible:ring-2 focus-visible:ring-flow focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-flow/40 disabled:text-ink/60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}
