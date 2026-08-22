import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  Wallet,
  LogOut,
  Users,
  CheckCircle2,
  XCircle,
  Bell,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format, subDays, addDays, differenceInMinutes } from "date-fns";
import { COLORS, loadDayflowFonts } from "../lib/theme.js";
import { api, setToken } from "../lib/api.js";

loadDayflowFonts();

const iso = (d) => format(d, "yyyy-MM-dd");
const todayIso = () => iso(new Date());

function StatusDot({ status }) {
  const color =
    status === "PRESENT" ? COLORS.tide : status === "LEAVE" ? COLORS.coral : COLORS.flow;
  const label = { PRESENT: "Present", ABSENT: "Absent", HALF_DAY: "Half-day", LEAVE: "On leave" }[status] || status;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm" style={{ color: "#4A4638" }}>{label}</span>
    </span>
  );
}

function FlowRing({ percent, subtitle }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  return (
    <div className="flex items-center gap-3">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke={COLORS.mist} strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r} fill="none" stroke={COLORS.flow} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} transform="rotate(-90 36 36)"
        />
        <text x="36" y="40" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="16" fontWeight="600" fill={COLORS.ink}>
          {Math.round(clamped)}%
        </text>
      </svg>
      <div>
        <p className="text-xs uppercase tracking-wide" style={{ color: "#8A8578" }}>Today</p>
        <p className="text-sm font-medium" style={{ color: COLORS.ink, fontFamily: "JetBrains Mono, monospace" }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.mist}` }}>
      {children}
    </div>
  );
}

function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-2 text-sm py-8 justify-center" style={{ color: "#8A8578" }}>
      <Loader2 size={16} className="animate-spin" /> {label}
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="text-xs rounded-lg px-3 py-2 mb-4" style={{ backgroundColor: "#FBEAE5", color: COLORS.coral }}>
      {message}
    </div>
  );
}

function FlowChart({ data }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium" style={{ color: COLORS.ink }}>This week's flow</p>
          <p className="text-xs" style={{ color: "#8A8578" }}>Hours logged against your 8h rhythm</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#EFEAE0" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8A8578" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#8A8578" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${COLORS.mist}`, fontSize: 12 }} formatter={(v) => [`${v}h`, "Logged"]} />
          <Area type="monotone" dataKey="target" stroke="none" fill="#F3ECDC" fillOpacity={0.6} />
          <Line type="monotone" dataKey="hours" stroke={COLORS.flow} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.flow, strokeWidth: 0 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

function QuickCard({ icon: Icon, title, sub, onClick }) {
  return (
    <button onClick={onClick} className="text-left rounded-2xl p-4 flex-1 min-w-[160px] transition hover:-translate-y-0.5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.mist}` }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "#FBF0DC" }}>
        <Icon size={17} color={COLORS.flow} />
      </div>
      <p className="text-sm font-medium" style={{ color: COLORS.ink }}>{title}</p>
      <p className="text-xs mt-0.5" style={{ color: "#8A8578" }}>{sub}</p>
    </button>
  );
}

// ---------- Employee view ----------

function EmployeeView({ user }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [today, setToday] = useState(null);
  const [weekRecords, setWeekRecords] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payroll, setPayroll] = useState(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [busy, setBusy] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const from = iso(subDays(new Date(), 6));
      const to = todayIso();
      const [att, myLeaves, myPayroll] = await Promise.all([
        api.myAttendance(from, to),
        api.myLeaves(),
        api.myPayroll(),
      ]);
      setWeekRecords(att.records);
      setToday(att.records.find((r) => r.date.slice(0, 10) === todayIso()) || null);
      setLeaves(myLeaves.leaves);
      setPayroll(myPayroll.payroll);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleCheckIn() {
    setBusy(true);
    setError("");
    try {
      await api.checkIn();
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckOut() {
    setBusy(true);
    setError("");
    try {
      await api.checkOut();
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const chartData = useMemo(() => {
    const days = [...Array(7)].map((_, i) => subDays(new Date(), 6 - i));
    return days.map((d) => {
      const key = iso(d);
      const rec = weekRecords.find((r) => r.date.slice(0, 10) === key);
      let hours = 0;
      if (rec?.checkIn && rec?.checkOut) hours = +(differenceInMinutes(new Date(rec.checkOut), new Date(rec.checkIn)) / 60).toFixed(1);
      else if (rec?.checkIn) hours = +(differenceInMinutes(new Date(), new Date(rec.checkIn)) / 60).toFixed(1);
      return { day: format(d, "EEE"), hours, target: 8 };
    });
  }, [weekRecords]);

  const todayHours = today?.checkIn
    ? differenceInMinutes(today.checkOut ? new Date(today.checkOut) : new Date(), new Date(today.checkIn)) / 60
    : 0;
  const percent = Math.min(100, (todayHours / 8) * 100);
  const subtitle = `${Math.floor(todayHours)}h ${Math.round((todayHours % 1) * 60)}m logged`;

  if (loading) return <Spinner label="Loading your dashboard…" />;

  return (
    <div className="space-y-6">
      <ErrorBanner message={error} />

      <div className="flex flex-wrap gap-4">
        <QuickCard icon={User} title="Profile" sub={user.jobTitle || "View & edit details"} />
        <QuickCard
          icon={Clock}
          title={today?.checkIn && !today?.checkOut ? "Check out" : today?.checkOut ? "Checked out" : "Check in"}
          sub={busy ? "Working…" : today?.checkIn && !today?.checkOut ? "Tap to end your day" : today?.checkOut ? "See you tomorrow" : "Tap to start your day"}
          onClick={
            busy || today?.checkOut ? undefined : today?.checkIn ? handleCheckOut : handleCheckIn
          }
        />
        <QuickCard icon={CalendarDays} title="Leave requests" sub={`${leaves.filter((l) => l.status === "PENDING").length} pending`} onClick={() => setShowLeaveForm((v) => !v)} />
        <QuickCard icon={Wallet} title="Payroll" sub={payroll ? `Net ₹${payroll.net.toLocaleString("en-IN")}` : "View salary slip"} />
      </div>

      {showLeaveForm && <LeaveApplyForm onDone={() => { setShowLeaveForm(false); loadAll(); }} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <FlowChart data={chartData} />
        </div>
        <Card>
          <p className="text-sm font-medium mb-3" style={{ color: COLORS.ink }}>Recent leave requests</p>
          {leaves.length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>No leave requests yet.</p>}
          <div className="space-y-3">
            {leaves.slice(0, 4).map((l) => (
              <div key={l.id} className="pb-3" style={{ borderBottom: `1px solid #F1ECE1` }}>
                <div className="flex justify-between items-start">
                  <p className="text-sm" style={{ color: COLORS.ink }}>{l.type.replace("_", " ")}</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: l.status === "APPROVED" ? "#E7F0EC" : l.status === "REJECTED" ? "#FBEAE5" : "#FBF0DC",
                      color: l.status === "APPROVED" ? COLORS.tide : l.status === "REJECTED" ? COLORS.coral : COLORS.flow,
                    }}
                  >
                    {l.status.toLowerCase()}
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: "#8A8578" }}>
                  {format(new Date(l.startDate), "MMM d")} – {format(new Date(l.endDate), "MMM d")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function LeaveApplyForm({ onDone }) {
  const [type, setType] = useState("PAID");
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(todayIso());
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date can't be before the start date.");
      return;
    }
    setBusy(true);
    try {
      await api.applyLeave({ type, startDate, endDate, remarks });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <p className="text-sm font-medium mb-4" style={{ color: COLORS.ink }}>Apply for leave</p>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-xs font-medium" style={{ color: COLORS.ink }}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ border: `1px solid ${COLORS.mist}` }}>
            <option value="PAID">Paid</option>
            <option value="SICK">Sick</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: COLORS.ink }}>Start date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ border: `1px solid ${COLORS.mist}` }} />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: COLORS.ink }}>End date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ border: `1px solid ${COLORS.mist}` }} />
        </div>
        <button type="submit" disabled={busy} className="rounded-lg py-2.5 text-sm font-medium disabled:opacity-60" style={{ backgroundColor: COLORS.flow, color: COLORS.ink }}>
          {busy ? "Submitting…" : "Submit"}
        </button>
        <div className="md:col-span-4">
          <label className="text-xs font-medium" style={{ color: COLORS.ink }}>Remarks</label>
          <input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional note for your approver" className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ border: `1px solid ${COLORS.mist}` }} />
        </div>
      </form>
      <ErrorBanner message={error} />
    </Card>
  );
}

// ---------- Admin view ----------

function AdminView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [emp, att, pend] = await Promise.all([
        api.listEmployees(),
        api.teamAttendance(todayIso()),
        api.pendingLeaves(),
      ]);
      setEmployees(emp.users);
      setAttendance(att.records);
      setLeaves(pend.leaves);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function resolve(id, status) {
    try {
      await api.resolveLeave(id, status);
      setLeaves((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const statusFor = (userId) => attendance.find((a) => a.userId === userId)?.status || "ABSENT";
  const clockInFor = (userId) => {
    const rec = attendance.find((a) => a.userId === userId);
    return rec?.checkIn ? format(new Date(rec.checkIn), "HH:mm") : "—";
  };

  const kpis = useMemo(() => {
    const present = attendance.filter((a) => a.status === "PRESENT").length;
    const onLeave = attendance.filter((a) => a.status === "LEAVE").length;
    return [
      { label: "Present today", value: String(present), icon: CheckCircle2, tint: COLORS.tide },
      { label: "On leave", value: String(onLeave), icon: CalendarDays, tint: COLORS.coral },
      { label: "Pending approvals", value: String(leaves.length), icon: Bell, tint: COLORS.flow },
      { label: "Headcount", value: String(employees.length), icon: Users, tint: COLORS.ink },
    ];
  }, [attendance, leaves, employees]);

  if (loading) return <Spinner label="Loading team overview…" />;

  return (
    <div className="space-y-6">
      <ErrorBanner message={error} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <k.icon size={16} color={k.tint} />
            <p className="text-2xl mt-2" style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: COLORS.ink }}>{k.value}</p>
            <p className="text-xs" style={{ color: "#8A8578" }}>{k.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <p className="text-sm font-medium mb-4" style={{ color: COLORS.ink }}>Team attendance — today</p>
          <div className="space-y-3">
            {employees.map((e) => (
              <div key={e.id} className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid #F1ECE1` }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ backgroundColor: "#F1ECE1", color: COLORS.ink }}>
                    {e.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: COLORS.ink }}>{e.name}</p>
                    <p className="text-xs" style={{ color: "#8A8578" }}>{e.jobTitle || "—"} · {e.employeeId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: "#8A8578" }}>{clockInFor(e.id)}</span>
                  <StatusDot status={statusFor(e.id)} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium mb-4" style={{ color: COLORS.ink }}>Pending leave approvals</p>
          {leaves.length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>All caught up — nothing waiting on you.</p>}
          <div className="space-y-4">
            {leaves.map((l) => (
              <div key={l.id} className="pb-4" style={{ borderBottom: `1px solid #F1ECE1` }}>
                <p className="text-sm font-medium" style={{ color: COLORS.ink }}>{l.user.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8A8578" }}>
                  {l.type.replace("_", " ")} · {format(new Date(l.startDate), "MMM d")} – {format(new Date(l.endDate), "MMM d")}
                </p>
                {l.remarks && <p className="text-xs mt-1" style={{ color: "#4A4638" }}>{l.remarks}</p>}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => resolve(l.id, "APPROVED")} className="text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1" style={{ backgroundColor: COLORS.tide, color: "#FFFFFF" }}>
                    <CheckCircle2 size={13} /> Approve
                  </button>
                  <button onClick={() => resolve(l.id, "REJECTED")} className="text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1" style={{ border: `1px solid ${COLORS.mist}`, color: COLORS.coral }}>
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------- Shell ----------

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: User, label: "Profile" },
  { icon: Clock, label: "Attendance" },
  { icon: CalendarDays, label: "Leave" },
  { icon: Wallet, label: "Payroll" },
];

export default function Dashboard({ user, onLogout }) {
  const [active, setActive] = useState("Dashboard");
  const isAdmin = user.role === "ADMIN";

  function handleLogout() {
    setToken(null);
    onLogout();
  }

  return (
    <div className="min-h-screen w-full flex" style={{ backgroundColor: COLORS.paper, fontFamily: "Inter, sans-serif" }}>
      <aside className="w-56 shrink-0 px-4 py-6 flex flex-col justify-between" style={{ backgroundColor: COLORS.ink }}>
        <div>
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.flow }}>
              <ArrowUpRight size={15} color={COLORS.ink} />
            </div>
            <span className="text-lg" style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: "#FAF7F2" }}>Dayflow</span>
          </div>
          <nav className="space-y-1">
            {NAV.map((n) => (
              <button
                key={n.label}
                onClick={() => setActive(n.label)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition"
                style={{ backgroundColor: active === n.label ? "rgba(227,162,59,0.14)" : "transparent", color: active === n.label ? COLORS.flow : "#C9C3B4" }}
              >
                <n.icon size={16} />
                {n.label}
              </button>
            ))}
            {isAdmin && (
              <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: "#C9C3B4" }}>
                <ShieldCheck size={16} /> Admin
              </div>
            )}
          </nav>
        </div>

        <div className="space-y-3">
          <div className="px-2">
            <p className="text-sm font-medium" style={{ color: "#FAF7F2" }}>{user.name}</p>
            <p className="text-xs" style={{ color: "#8A8578" }}>{user.employeeId} · {isAdmin ? "Admin" : "Employee"}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: "#C9C3B4" }}>
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-8 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#8A8578" }}>
              {isAdmin ? "HR overview" : format(new Date(), "EEEE, MMM d")}
            </p>
            <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 24, color: COLORS.ink }}>
              {isAdmin ? "Good morning, team is aligned" : `Good morning, ${user.name.split(" ")[0]}`}
            </h1>
          </div>
        </div>
        {isAdmin ? <AdminView /> : <EmployeeView user={user} />}
      </main>
    </div>
  );
}
