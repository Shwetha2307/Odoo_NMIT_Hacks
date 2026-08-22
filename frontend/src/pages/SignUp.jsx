import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { COLORS } from "../lib/theme.js";
import { api } from "../lib/api.js";

export default function SignUp({ onSignedUp, onSwitchToSignIn }) {
  const [form, setForm] = useState({ employeeId: "", name: "", email: "", password: "", role: "EMPLOYEE" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const { employeeId, name, email, password } = form;
    if (!employeeId || !name || !email || !password) {
      setError("Fill in every field to continue.");
      return;
    }
    setLoading(true);
    try {
      await api.signup(form);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center px-4"
        style={{ backgroundColor: COLORS.paper, fontFamily: "Inter, sans-serif" }}
      >
        <div className="w-full max-w-sm text-center rounded-2xl p-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.mist}` }}>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 18, color: COLORS.ink }}>
            Account created
          </h1>
          <p className="text-sm mt-2" style={{ color: "#8A8578" }}>
            You can sign in now. (Wire up Nodemailer in the backend to actually send a verification email.)
          </p>
          <button
            onClick={onSwitchToSignIn}
            className="w-full rounded-lg py-2.5 text-sm font-medium mt-5"
            style={{ backgroundColor: COLORS.flow, color: COLORS.ink }}
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
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
            Create your account
          </h1>
          <p className="text-sm mt-1 mb-5" style={{ color: "#8A8578" }}>
            Register with your employee details.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>Employee ID</label>
              <input
                value={form.employeeId}
                onChange={(e) => update("employeeId", e.target.value)}
                placeholder="EMP-045"
                className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: `1px solid ${COLORS.mist}` }}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>Full name</label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Priya Menon"
                className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: `1px solid ${COLORS.mist}` }}
              />
            </div>
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
                placeholder="At least 8 characters, mix of case and a number"
                className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: `1px solid ${COLORS.mist}` }}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>Role</label>
              <select
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: `1px solid ${COLORS.mist}` }}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">HR / Admin</option>
              </select>
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
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-xs text-center mt-4" style={{ color: "#8A8578" }}>
          Already registered?{" "}
          <button onClick={onSwitchToSignIn} className="font-medium" style={{ color: COLORS.ink }}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
