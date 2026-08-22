import { ShieldCheck, ArrowUpRight } from "lucide-react";
import AuthBranding from "../components/auth/AuthBranding.jsx";
import LoginForm from "../components/auth/LoginForm.jsx";

export default function Login() {
  return (
    <div className="flex min-h-screen bg-paper">
      <AuthBranding />

      <div className="flex w-full flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-sm animate-card-in">
          {/* Compact brand mark, shown only where the branding panel is hidden */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-flow">
              <ArrowUpRight className="h-4 w-4 text-ink" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Dayflow
            </span>
          </div>

          <div className="rounded-2xl border border-mist bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-[#8A8578]">
              Sign in to continue to Dayflow
            </p>

            <div className="mt-6">
              <LoginForm />
            </div>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[#8A8578]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Secure access to your Dayflow workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
