import React, { useState, useMemo } from "react";
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

/*
  Dayflow — design tokens
  ink      #17203A  primary text / sidebar
  paper    #FAF7F2  page background
  flow     #E3A23B  primary accent (the "day" — warmth, momentum)
  tide     #2F6F62  present / approved / success
  coral    #C6553D  absent / rejected / alerts
  mist     #D8D2C2  hairlines, muted surfaces
  Display face: Space Grotesk (geometric, used sparingly for numerals/headings)
  Body face:   Inter
  Data face:   JetBrains Mono (times, ids, hours)
*/

const FONT_IMPORT_ID = "dayflow-fonts";
if (typeof document !== "undefined" && !document.getElementById(FONT_IMPORT_ID)) {
  const link = document.createElement("link");
  link.id = FONT_IMPORT_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
  document.head.appendChild(link);
}

const COLORS = {
  ink: "#17203A",
  paper: "#FAF7F2",
  flow: "#E3A23B",
  tide: "#2F6F62",
  coral: "#C6553D",
  mist: "#D8D2C2",
  card: "#FFFFFF",
};

const weekFlow = [
  { day: "Mon", hours: 8.5, target: 8 },
  { day: "Tue", hours: 8.1, target: 8 },
  { day: "Wed", hours: 7.4, target: 8 },
  { day: "Thu", hours: 8.8, target: 8 },
  { day: "Fri", hours: 6.2, target: 8 },
  { day: "Sat", hours: 0, target: 0 },
  { day: "Sun", hours: 0, target: 0 },
];

const employees = [
  { id: "EMP-014", name: "Ananya Rao", role: "Product Designer", status: "Present", clockIn: "09:12" },
  { id: "EMP-021", name: "Vikram Sethi", role: "Backend Engineer", status: "Present", clockIn: "08:57" },
  { id: "EMP-009", name: "Farah Iqbal", role: "HR Associate", status: "On leave", clockIn: "—" },
  { id: "EMP-033", name: "Rohan Mehta", role: "QA Engineer", status: "Half-day", clockIn: "09:40" },
  { id: "EMP-018", name: "Divya Nair", role: "Frontend Engineer", status: "Present", clockIn: "09:05" },
];

const pendingLeaves = [
  { id: 1, name: "Farah Iqbal", type: "Sick leave", range: "Aug 24 – Aug 25", note: "Fever, doctor advised rest" },
  { id: 2, name: "Karthik Iyer", type: "Paid leave", range: "Sep 01 – Sep 03", note: "Family function" },
];

function StatusDot({ status }) {
  const color =
    status === "Present" ? COLORS.tide : status === "On leave" ? COLORS.coral : COLORS.flow;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm" style={{ color: "#4A4638" }}>{status}</span>
    </span>
  );
}

function FlowRing({ percent = 78, label = "Today" }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="flex items-center gap-3">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke={COLORS.mist} strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={COLORS.flow}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 36 36)"
        />
        <text
          x="36"
          y="40"
          textAnchor="middle"
          fontFamily="Space Grotesk, sans-serif"
          fontSize="16"
          fontWeight="600"
          fill={COLORS.ink}
        >
          {percent}%
        </text>
      </svg>
      <div>
        <p className="text-xs uppercase tracking-wide" style={{ color: "#8A8578" }}>{label}</p>
        <p className="text-sm font-medium" style={{ color: COLORS.ink, fontFamily: "JetBrains Mono, monospace" }}>
          6h 24m logged
        </p>
      </div>
    </div>
  );
}

function QuickCard({ icon: Icon, title, sub }) {
  return (
    <button
      className="text-left rounded-2xl p-4 flex-1 min-w-[160px] transition hover:-translate-y-0.5"
      style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.mist}` }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: "#FBF0DC" }}
      >
        <Icon size={17} color={COLORS.flow} />
      </div>
      <p className="text-sm font-medium" style={{ color: COLORS.ink }}>{title}</p>
      <p className="text-xs mt-0.5" style={{ color: "#8A8578" }}>{sub}</p>
    </button>
  );
}

function FlowChart() {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.mist}` }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium" style={{ color: COLORS.ink }}>This week's flow</p>
          <p className="text-xs" style={{ color: "#8A8578" }}>Hours logged against your 8h rhythm</p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ backgroundColor: "#E7F0EC", color: COLORS.tide }}
        >
          On pace
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={weekFlow} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#EFEAE0" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8A8578" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#8A8578" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: `1px solid ${COLORS.mist}`, fontSize: 12 }}
            formatter={(v) => [`${v}h`, "Logged"]}
          />
          <Area type="monotone" dataKey="target" stroke="none" fill="#F3ECDC" fillOpacity={0.6} />
          <Line
            type="monotone"
            dataKey="hours"
            stroke={COLORS.flow}
            strokeWidth={2.5}
            dot={{ r: 4, fill: COLORS.flow, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmployeeView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <QuickCard icon={User} title="Profile" sub="View & edit details" />
        <QuickCard icon={Clock} title="Attendance" sub="Daily & weekly log" />
        <QuickCard icon={CalendarDays} title="Leave requests" sub="1 pending approval" />
        <QuickCard icon={Wallet} title="Payroll" sub="View salary slip" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <FlowChart />
        </div>
        <div className="rounded-2xl p-5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.mist}` }}>
          <p className="text-sm font-medium mb-3" style={{ color: COLORS.ink }}>Leave balance</p>
          {[
            { label: "Paid leave", used: 4, total: 12 },
            { label: "Sick leave", used: 1, total: 6 },
            { label: "Unpaid", used: 0, total: "—" },
          ].map((l) => (
            <div key={l.label} className="mb-3">
              <div className="flex justify-between text-xs mb-1" style={{ color: "#4A4638" }}>
                <span>{l.label}</span>
                <span style={{ fontFamily: "JetBrains Mono, monospace" }}>{l.used}/{l.total}</span>
              </div>
              {typeof l.total === "number" && (
                <div className="h-1.5 rounded-full" style={{ backgroundColor: "#EFEAE0" }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${(l.used / l.total) * 100}%`, backgroundColor: COLORS.tide }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminView() {
  const [leaves, setLeaves] = useState(pendingLeaves);
  const resolve = (id) => setLeaves((prev) => prev.filter((l) => l.id !== id));

  const kpis = useMemo(
    () => [
      { label: "Present today", value: "42", icon: CheckCircle2, tint: COLORS.tide },
      { label: "On leave", value: "3", icon: CalendarDays, tint: COLORS.coral },
      { label: "Pending approvals", value: String(leaves.length), icon: Bell, tint: COLORS.flow },
      { label: "Headcount", value: "51", icon: Users, tint: COLORS.ink },
    ],
    [leaves]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.mist}` }}>
            <k.icon size={16} color={k.tint} />
            <p className="text-2xl mt-2" style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: COLORS.ink }}>
              {k.value}
            </p>
            <p className="text-xs" style={{ color: "#8A8578" }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.mist}` }}>
          <p className="text-sm font-medium mb-4" style={{ color: COLORS.ink }}>Team attendance</p>
          <div className="space-y-3">
            {employees.map((e) => (
              <div key={e.id} className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid #F1ECE1` }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: "#F1ECE1", color: COLORS.ink }}
                  >
                    {e.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: COLORS.ink }}>{e.name}</p>
                    <p className="text-xs" style={{ color: "#8A8578" }}>{e.role} · {e.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: "#8A8578" }}>
                    {e.clockIn}
                  </span>
                  <StatusDot status={e.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.mist}` }}>
          <p className="text-sm font-medium mb-4" style={{ color: COLORS.ink }}>Pending leave approvals</p>
          {leaves.length === 0 && (
            <p className="text-xs" style={{ color: "#8A8578" }}>All caught up — nothing waiting on you.</p>
          )}
          <div className="space-y-4">
            {leaves.map((l) => (
              <div key={l.id} className="pb-4" style={{ borderBottom: `1px solid #F1ECE1` }}>
                <p className="text-sm font-medium" style={{ color: COLORS.ink }}>{l.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8A8578" }}>{l.type} · {l.range}</p>
                <p className="text-xs mt-1" style={{ color: "#4A4638" }}>{l.note}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => resolve(l.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
                    style={{ backgroundColor: COLORS.tide, color: "#FFFFFF" }}
                  >
                    <CheckCircle2 size={13} /> Approve
                  </button>
                  <button
                    onClick={() => resolve(l.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
                    style={{ border: `1px solid ${COLORS.mist}`, color: COLORS.coral }}
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: User, label: "Profile" },
  { icon: Clock, label: "Attendance" },
  { icon: CalendarDays, label: "Leave" },
  { icon: Wallet, label: "Payroll" },
];

export default function Dashboard() {
  const [role, setRole] = useState("employee");
  const [active, setActive] = useState("Dashboard");
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen w-full flex" style={{ backgroundColor: COLORS.paper, fontFamily: "Inter, sans-serif" }}>
      <aside className="w-56 shrink-0 px-4 py-6 flex flex-col justify-between" style={{ backgroundColor: COLORS.ink }}>
        <div>
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.flow }}>
              <ArrowUpRight size={15} color={COLORS.ink} />
            </div>
            <span
              className="text-lg"
              style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, color: "#FAF7F2" }}
            >
              Dayflow
            </span>
          </div>
          <nav className="space-y-1">
            {NAV.map((n) => (
              <button
                key={n.label}
                onClick={() => setActive(n.label)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition"
                style={{
                  backgroundColor: active === n.label ? "rgba(227,162,59,0.14)" : "transparent",
                  color: active === n.label ? COLORS.flow : "#C9C3B4",
                }}
              >
                <n.icon size={16} />
                {n.label}
              </button>
            ))}
            {isAdmin && (
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
                style={{ color: "#C9C3B4" }}
              >
                <ShieldCheck size={16} />
                Admin tools
              </button>
            )}
          </nav>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs" style={{ color: "#8A8578" }}>Viewing as</span>
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #33405E" }}>
              {["employee", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className="text-xs px-2 py-1 capitalize"
                  style={{
                    backgroundColor: role === r ? COLORS.flow : "transparent",
                    color: role === r ? COLORS.ink : "#C9C3B4",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: "#C9C3B4" }}>
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-8 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#8A8578" }}>
              {isAdmin ? "HR overview" : "Saturday, Aug 22"}
            </p>
            <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 24, color: COLORS.ink }}>
              {isAdmin ? "Good morning, team is aligned" : "Good morning, Ananya"}
            </h1>
          </div>
          {!isAdmin && <FlowRing percent={78} />}
        </div>
        {isAdmin ? <AdminView /> : <EmployeeView />}
      </main>
    </div>
  );
}