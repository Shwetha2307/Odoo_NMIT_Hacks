import React, { useEffect, useState } from "react";
import { COLORS } from "../lib/theme.js";
import { api } from "../lib/api.js";
import { Card, Row, Field } from "../components/ui.jsx";

export default function Profile({ user }) {
  const [profile, setProfile] = useState(user);
  const [form, setForm] = useState({ phone: user.phone || "", address: user.address || "", photoUrl: user.photoUrl || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.me().then((r) => {
      setProfile(r.user);
      setForm({ phone: r.user.phone || "", address: r.user.address || "", photoUrl: r.user.photoUrl || "" });
    }).catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const { user: updated } = await api.updateMe(form);
      setProfile(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Card>
        <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: COLORS.ink }}>Personal & job details</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Name" value={profile.name} />
          <Row label="Email" value={profile.email} />
          <Row label="Employee ID" value={profile.employeeId} />
          <Row label="Job title" value={profile.jobTitle || "—"} />
          <Row label="Department" value={profile.department || "—"} />
          <Row label="Date of joining" value={profile.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : "—"} />
        </dl>
      </Card>

      <Card>
        <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: COLORS.ink }}>Editable details</h2>
        <div className="mt-3 space-y-3">
          <Field label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          <Field label="Address" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
          <Field label="Photo URL" value={form.photoUrl} onChange={(v) => setForm((f) => ({ ...f, photoUrl: v }))} />
          {error && <p className="text-xs rounded-lg px-3 py-2" style={{ backgroundColor: "#FBEAE5", color: COLORS.coral }}>{error}</p>}
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
            style={{ backgroundColor: COLORS.flow, color: COLORS.ink }}
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
          </button>
        </div>
      </Card>
    </div>
  );
}
