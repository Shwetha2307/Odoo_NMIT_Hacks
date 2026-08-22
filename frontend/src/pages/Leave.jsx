import React, { useEffect, useState, useCallback } from "react";
import { Check, X } from "lucide-react";
import { COLORS } from "../lib/theme.js";
import { api } from "../lib/api.js";
import { Card, Pill, Table } from "../components/ui.jsx";

const leaveTone = { PENDING: "amber", APPROVED: "flow", REJECTED: "coral" };

export default function Leave({ isAdmin }) {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ type: "PAID", startDate: "", endDate: "", remarks: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (isAdmin) {
      const { leaves } = await api.pendingLeaves();
      setLeaves(leaves);
    } else {
      const { leaves } = await api.myLeaves();
      setLeaves(leaves);
    }
  }, [isAdmin]);

  useEffect(() => { load().catch(() => {}); }, [load]);

  async function apply(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      await api.applyLeave(form);
      setForm({ type: "PAID", startDate: "", endDate: "", remarks: "" });
      await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function resolve(id, status) {
    await api.resolveLeave(id, status, status === "APPROVED" ? "Approved" : "Rejected");
    await load();
  }

  return (
    <div className="space-y-4">
      {!isAdmin && (
        <Card>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: COLORS.ink }}>Apply for leave</h2>
          <form onSubmit={apply} className="grid sm:grid-cols-4 gap-3 mt-3 items-end">
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="mt-1 w-full rounded-lg px-2 py-2 text-sm" style={{ border: `1px solid ${COLORS.mist}` }}>
                <option value="PAID">Paid</option>
                <option value="SICK">Sick</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>From</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="mt-1 w-full rounded-lg px-2 py-2 text-sm" style={{ border: `1px solid ${COLORS.mist}` }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: COLORS.ink }}>To</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="mt-1 w-full rounded-lg px-2 py-2 text-sm" style={{ border: `1px solid ${COLORS.mist}` }} />
            </div>
            <button type="submit" disabled={busy} className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60 h-[38px]" style={{ backgroundColor: COLORS.flow, color: COLORS.ink }}>
              {busy ? "Submitting…" : "Submit"}
            </button>
            <input
              placeholder="Remarks (optional)"
              value={form.remarks}
              onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
              className="sm:col-span-4 rounded-lg px-3 py-2 text-sm"
              style={{ border: `1px solid ${COLORS.mist}` }}
            />
          </form>
          {error && <p className="text-xs mt-3 rounded-lg px-3 py-2" style={{ backgroundColor: "#FBEAE5", color: COLORS.coral }}>{error}</p>}
        </Card>
      )}

      <Card>
        <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: COLORS.ink }}>
          {isAdmin ? "Pending approvals" : "Your requests"}
        </h2>
        <Table
          columns={isAdmin ? ["Employee", "Type", "Dates", "Remarks", "Action"] : ["Type", "Dates", "Remarks", "Status"]}
          rows={leaves.map((l) => isAdmin
            ? [
                `${l.user.name} (${l.user.employeeId})`,
                l.type,
                `${new Date(l.startDate).toLocaleDateString()} → ${new Date(l.endDate).toLocaleDateString()}`,
                l.remarks || "—",
                <div key="a" className="flex gap-2">
                  <button onClick={() => resolve(l.id, "APPROVED")} className="p-1.5 rounded-md" style={{ backgroundColor: COLORS.flow }}><Check size={14} color={COLORS.ink} /></button>
                  <button onClick={() => resolve(l.id, "REJECTED")} className="p-1.5 rounded-md" style={{ backgroundColor: "#FBEAE5" }}><X size={14} color={COLORS.coral} /></button>
                </div>,
              ]
            : [
                l.type,
                `${new Date(l.startDate).toLocaleDateString()} → ${new Date(l.endDate).toLocaleDateString()}`,
                l.remarks || "—",
                <Pill key="s" tone={leaveTone[l.status]}>{l.status}</Pill>,
              ])}
          empty={isAdmin ? "No pending requests." : "You haven't applied for leave yet."}
        />
      </Card>
    </div>
  );
}
