import React, { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { COLORS } from "../lib/theme.js";
import { api } from "../lib/api.js";
import { Card, Pill, Table } from "../components/ui.jsx";

const statusTone = { PRESENT: "flow", ABSENT: "coral", HALF_DAY: "amber", LEAVE: "sky" };

export default function Attendance({ isAdmin }) {
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
