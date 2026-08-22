import React, { useState } from "react";
import {
  ArrowUpRight, User as UserIcon, Clock, CalendarDays, Wallet,
  Users, LogOut,
} from "lucide-react";
import { COLORS } from "../lib/theme.js";
import { setToken } from "../lib/api.js";
import Profile from "./Profile.jsx";
import Attendance from "./Attendance.jsx";
import Leave from "./Leave.jsx";
import Payroll from "./Payroll.jsx";
import Team from "./Team.jsx";

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
          {activeTab === "overview" && <Profile user={user} />}
          {activeTab === "attendance" && <Attendance isAdmin={isAdmin} />}
          {activeTab === "leave" && <Leave isAdmin={isAdmin} />}
          {activeTab === "payroll" && <Payroll isAdmin={isAdmin} />}
          {activeTab === "team" && isAdmin && <Team />}
        </main>
      </div>
    </div>
  );
}
