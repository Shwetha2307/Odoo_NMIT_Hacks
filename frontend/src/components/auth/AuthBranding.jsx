import { Users, Clock, Wallet, ArrowUpRight } from "lucide-react";
import FeatureItem from "./FeatureItem.jsx";

const FEATURES = [
  { icon: Users, label: "Employee Management" },
  { icon: Clock, label: "Attendance & Leave" },
  { icon: Wallet, label: "Payroll & HR Workflows" },
];

/**
 * Left-side branding panel. Hidden on small screens so the login
 * form stays front and center on mobile. Shares the ink/flow/mist
 * design tokens used in src/pages/Dashboard.jsx.
 */
export default function AuthBranding() {
  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-ink px-10 py-12 text-white lg:flex lg:px-14">
      {/* Subtle abstract shapes — restrained, not decorative clutter */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-flow/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-tide/20 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-flow">
            <ArrowUpRight className="h-4 w-4 text-ink" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Dayflow
          </span>
        </div>

        <h1 className="mt-10 max-w-sm font-display text-3xl font-semibold leading-tight tracking-tight">
          Every workday, perfectly aligned.
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
          One simple platform for managing your workforce, attendance, leave
          and HR operations.
        </p>
      </div>

      <ul className="relative space-y-4">
        {FEATURES.map((feature) => (
          <FeatureItem key={feature.label} icon={feature.icon} label={feature.label} />
        ))}
      </ul>
    </div>
  );
}
