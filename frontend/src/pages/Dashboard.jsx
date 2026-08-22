import React, { useEffect, useState, useCallback } from "react";
import {
  ArrowUpRight, User as UserIcon, Clock, CalendarDays, Wallet,
  Users, LogOut, Check, X,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { COLORS } from "../lib/theme.js";
import { api, setToken } from "../lib/api.js";

const EMPLOYEE_TABS = [
  { key: "overview", label: "Profile", icon: UserIcon },
  { key: "attendance", label: "Attendance", icon: Clock },
  { key: "leave", label: "Leave Requests", icon: CalendarDays },
  { key: "payroll", label: "Payroll", icon: Wallet },
];

const ADMIN_TABS = [
  { key: "team", label: "Employees", icon: Users },
  { key: "attendance", label: "Attendance", icon: Clock },
  { key: "leave", label: "Leave Approvals", icon: CalendarDays },
  { key: "payroll", label: "Payroll", icon: Wallet },
];

function Card({ children, style, ...rest }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.mist}`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

function Pill({ children, tone = "flow" }) {
  const bg = { flow: COLORS.flow, amber: "#FCF0DA", coral: "#FBEAE5", sky: "#EAF3F8" }[tone];
  const fg = { flow: COLORS.ink, amber: "#93691E", coral: COLORS.coral, sky: "#2C6E8E" }[tone];
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: bg, color: fg }}>
      {children}
    </span>
  );
}

const statusTone = { PRESENT: "flow", ABSENT: "coral", HALF_DAY: "amber", LEAVE: "sky" };
const leaveTone = { PENDING: "amber", APPROVED: "flow", REJECTED: "coral" };

export default function Dashboard({ user, onLogout }) {
  const isAdmin = user.role === "ADMIN";
  const tabs = isAdmin ? ADMIN_TABS : EMPLOYEE_TABS;
  const [activeTab, setActiveTab] = useState(isAdmin ? "team" : "overview");

  function handleLogout() {
    setToken(null);
    onLogout();
  }

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: COLORS.paper, fontFamily: "Inter, sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${COLORS.mist}` }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.flow }}>
            <ArrowUpRight size={16} color={COLORS.ink} />
          </div>
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 18, color: COLORS.ink }}>
            Dayflow
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium" style={{ color: COLORS.ink }}>{user.name}</p>
            <p className="text-xs" style={{ color: COLORS.muted }}>{isAdmin ? "HR / Admin" : "Employee"} · {user.employeeId}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs font-medium rounded-lg px-3 py-2"
            style={{ border: `1px solid ${COLORS.mist}`, color: COLORS.ink }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <div className="flex max-w-6xl mx-auto">
        <nav className="w-52 shrink-0 py-6 pr-4 hidden sm:block">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="w-full flex items-center gap-2 text-sm rounded-lg px-3 py-2 mb-1 text-left"
                style={{
                  backgroundColor: active ? COLORS.flow : "transparent",
                  color: COLORS.ink,
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </nav>

        <main className="flex-1 py-6 px-1 sm:px-0">
          {activeTab === "overview" && <ProfileSection user={user} />}
          {activeTab === "attendance" && <AttendanceSection isAdmin={isAdmin} />}
          {activeTab === "leave" && <LeaveSection isAdmin={isAdmin} />}
          {activeTab === "payroll" && <PayrollSection isAdmin={isAdmin} />}
          {activeTab === "team" && isAdmin && <TeamSection onOpenPayroll={() => setActiveTab("payroll")} />}
        </main>
      </div>
    </div>
  );
}

/* ---------------- Profile ---------------- */

function ProfileSection({ user }) {
  const [profile, setProfile] = useState(user);
  const [form, setForm] = useState({ phone: user.phone || "", address: user.address || "", photoUrl: user.photoUrl || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.me().then((r) => {
      setProfile(r.user);
      setForm({ phone: r.user.phone || "", address: r.user.address || "", photoUrl: r.user.photoUrl || "" });
    }).catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const { user: updated } = await api.updateMe(form);
      setProfile(updated);
      setSaved(true);
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

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt style={{ color: COLORS.muted }}>{label}</dt>
      <dd style={{ color: COLORS.ink }}>{value}</dd>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium" style={{ color: COLORS.ink }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={{ border: `1px solid ${COLORS.mist}` }}
      />
    </div>
  );
}

/* ---------------- Attendance ---------------- */

function AttendanceSection({ isAdmin }) {
  const [records, setRecords] = useState([]);
  const [today, setToday] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (isAdmin) {
      const { records } = await api.teamAttendance(today);
      setRecords(records);
    } else {
      const to = new Date().toISOString().slice(0, 10);
      const from = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
      const { records } = await api.myAttendance(from, to);
      setRecords(records);
    }
  }, [isAdmin, today]);

  useEffect(() => { load().catch(() => {}); }, [load]);

  async function doCheckIn() {
    setBusy(true); setError("");
    try { await api.checkIn(); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function doCheckOut() {
    setBusy(true); setError("");
    try { await api.checkOut(); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  const chartData = !isAdmin
    ? [...records].reverse().map((r) => ({
        day: new Date(r.date).toLocaleDateString(undefined, { weekday: "short" }),
        hours: r.checkIn && r.checkOut
          ? Number(((new Date(r.checkOut) - new Date(r.checkIn)) / 3600000).toFixed(1))
          : 0,
      }))
    : [];

  return (
    <div className="space-y-4">
      {!isAdmin && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: COLORS.ink }}>Today</h2>
              <p className="text-xs mt-1" style={{ color: COLORS.muted }}>Check in when you start, check out when you're done.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={doCheckIn} disabled={busy} className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60" style={{ backgroundColor: COLORS.flow, color: COLORS.ink }}>
                Check in
              </button>
              <button onClick={doCheckOut} disabled={busy} className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60" style={{ border: `1px solid ${COLORS.mist}`, color: COLORS.ink }}>
                Check out
              </button>
            </div>
          </div>
          {error && <p className="text-xs mt-3 rounded-lg px-3 py-2" style={{ backgroundColor: "#FBEAE5", color: COLORS.coral }}>{error}</p>}
        </Card>
      )}

      {!isAdmin && chartData.length > 0 && (
        <Card>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: COLORS.ink }}>This week</h2>
          <div style={{ width: "100%", height: 200 }} className="mt-2">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.mist} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: COLORS.muted }} />
                <YAxis tick={{ fontSize: 12, fill: COLORS.muted }} />
                <Tooltip />
                <Bar dataKey="hours" fill={COLORS.flowDark} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {isAdmin && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: COLORS.ink }}>Attendance — {today}</h2>
            <input type="date" value={today} onChange={(e) => setToday(e.target.value)} className="text-sm rounded-lg px-2 py-1" style={{ border: `1px solid ${COLORS.mist}` }} />
          </div>
          <Table
            columns={["Employee", "Check-in", "Check-out", "Status"]}
            rows={records.map((r) => [
              `${r.user.name} (${r.user.employeeId})`,
              r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "—",
              r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "—",
              <Pill key="s" tone={statusTone[r.status]}>{r.status}</Pill>,
            ])}
            empty="No attendance records for this date yet."
          />
        </Card>
      )}

      {!isAdmin && (
        <Card>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: COLORS.ink }}>Last 7 days</h2>
          <Table
            columns={["Date", "Check-in", "Check-out", "Status"]}
            rows={records.map((r) => [
              new Date(r.date).toLocaleDateString(),
              r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "—",
              r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "—",
              <Pill key="s" tone={statusTone[r.status]}>{r.status}</Pill>,
            ])}
            empty="No attendance recorded yet."
          />
        </Card>
      )}
    </div>
  );
}

/* ---------------- Leave ---------------- */

function LeaveSection({ isAdmin }) {
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

/* ---------------- Payroll ---------------- */

function PayrollSection({ isAdmin }) {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ baseSalary: 0, allowances: 0, deductions: 0 });

  const load = useCallback(async () => {
    if (isAdmin) {
      const { payroll } = await api.allPayroll();
      setRows(payroll);
    } else {
      const { payroll } = await api.myPayroll();
      setRows([payroll]);
    }
  }, [isAdmin]);

  useEffect(() => { load().catch(() => {}); }, [load]);

  function startEdit(row) {
    setEditing(row.id);
    setForm({ baseSalary: row.baseSalary, allowances: row.allowances, deductions: row.deductions });
  }

  async function save(id) {
    await api.updatePayroll(id, form);
    setEditing(null);
    await load();
  }

  return (
    <Card>
      <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: COLORS.ink }}>
        {isAdmin ? "Everyone's payroll" : "Your salary breakdown"}
      </h2>
      <p className="text-xs mt-1 mb-3" style={{ color: COLORS.muted }}>
        {isAdmin ? "Update salary structure per employee." : "Read-only — contact HR for changes."}
      </p>
      <Table
        columns={isAdmin ? ["Employee", "Base", "Allowances", "Deductions", "Net", "Action"] : ["Base", "Allowances", "Deductions", "Net"]}
        rows={rows.map((r) => {
          const isEditing = editing === r.id;
          const base = isAdmin
            ? [
                `${r.name} (${r.employeeId})`,
                isEditing ? <NumInput key="b" v={form.baseSalary} on={(v) => setForm((f) => ({ ...f, baseSalary: v }))} /> : `₹${r.baseSalary}`,
                isEditing ? <NumInput key="a" v={form.allowances} on={(v) => setForm((f) => ({ ...f, allowances: v }))} /> : `₹${r.allowances}`,
                isEditing ? <NumInput key="d" v={form.deductions} on={(v) => setForm((f) => ({ ...f, deductions: v }))} /> : `₹${r.deductions}`,
                `₹${r.netSalary}`,
              ]
            : [`₹${r.baseSalary}`, `₹${r.allowances}`, `₹${r.deductions}`, `₹${r.netSalary}`];
          if (isAdmin) {
            base.push(
              isEditing ? (
                <button key="save" onClick={() => save(r.id)} className="text-xs font-medium rounded-md px-2 py-1" style={{ backgroundColor: COLORS.flow, color: COLORS.ink }}>Save</button>
              ) : (
                <button key="edit" onClick={() => startEdit(r)} className="text-xs font-medium rounded-md px-2 py-1" style={{ border: `1px solid ${COLORS.mist}`, color: COLORS.ink }}>Edit</button>
              )
            );
          }
          return base;
        })}
        empty="No payroll data yet."
      />
    </Card>
  );
}

function NumInput({ v, on }) {
  return (
    <input
      type="number"
      value={v}
      onChange={(e) => on(Number(e.target.value))}
      className="w-20 rounded-md px-2 py-1 text-sm"
      style={{ border: `1px solid ${COLORS.mist}` }}
    />
  );
}

/* ---------------- Team (admin) ---------------- */

function TeamSection() {
  const [users, setUsers] = useState([]);

  useEffect(() => { api.listEmployees().then((r) => setUsers(r.users)).catch(() => {}); }, []);

  return (
    <Card>
      <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: COLORS.ink }}>Employees</h2>
      <Table
        columns={["Name", "Employee ID", "Role", "Department", "Email"]}
        rows={users.map((u) => [
          u.name,
          u.employeeId,
          <Pill key="r" tone={u.role === "ADMIN" ? "amber" : "flow"}>{u.role}</Pill>,
          u.department || "—",
          u.email,
        ])}
        empty="No employees registered yet."
      />
    </Card>
  );
}

/* ---------------- Shared table ---------------- */

function Table({ columns, rows, empty }) {
  if (rows.length === 0) {
    return <p className="text-sm mt-3" style={{ color: COLORS.muted }}>{empty}</p>;
  }
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: `1px solid ${COLORS.mist}` }}>
            {columns.map((c) => (
              <th key={c} className="text-left font-medium py-2 pr-4" style={{ color: COLORS.muted }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${COLORS.mist}` }}>
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4" style={{ color: COLORS.ink }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
