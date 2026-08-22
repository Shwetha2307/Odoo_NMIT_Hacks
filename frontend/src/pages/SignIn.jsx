import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { COLORS } from "../lib/theme.js";
import { api, setToken } from "../lib/api.js";

export default function SignIn({ onSignedIn, onSwitchToSignUp }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await api.signin(form);
      setToken(token);
      onSignedIn(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4"
      style={{ backgroundColor: COLORS.paper, fontFamily: "Inter, sans-serif" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.flow }}>
            <ArrowUpRight size={16} color={COLORS.ink} />
          </div>
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 20, color: COLORS.ink }}>
            Dayflow
          </span>
        </div>

        <div className="rounded-2xl p-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.mist}` }}>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 18, color: COLORS.ink }}>
            Welcome back
          </h1>
          <p className="text-sm mt-1 mb-5" style={{ color: COLORS.muted }}>
            Sign in with your registered email.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="name@company.com"
                className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: `1px solid ${COLORS.mist}` }}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: `1px solid ${COLORS.mist}` }}
              />
            </div>

            {error && (
              <p className="text-xs rounded-lg px-3 py-2" style={{ backgroundColor: "#FBEAE5", color: COLORS.coral }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-medium mt-2 disabled:opacity-60"
              style={{ backgroundColor: COLORS.flow, color: COLORS.ink }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-xs text-center mt-4" style={{ color: COLORS.muted }}>
          New here?{" "}
          <button onClick={onSwitchToSignUp} className="font-medium" style={{ color: COLORS.ink }}>
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
