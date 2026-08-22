import React, { useEffect, useState, useCallback } from "react";
import { COLORS } from "../lib/theme.js";
import { api } from "../lib/api.js";
import { Card, Table, NumInput } from "../components/ui.jsx";

export default function Payroll({ isAdmin }) {
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
    setForm({ baseSalary: row.base, allowances: row.allowances, deductions: row.deductions });
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
                isEditing ? <NumInput key="b" v={form.baseSalary} on={(v) => setForm((f) => ({ ...f, baseSalary: v }))} /> : `₹${r.base}`,
                isEditing ? <NumInput key="a" v={form.allowances} on={(v) => setForm((f) => ({ ...f, allowances: v }))} /> : `₹${r.allowances}`,
                isEditing ? <NumInput key="d" v={form.deductions} on={(v) => setForm((f) => ({ ...f, deductions: v }))} /> : `₹${r.deductions}`,
                `₹${r.net}`,
              ]
            : [`₹${r.base}`, `₹${r.allowances}`, `₹${r.deductions}`, `₹${r.net}`];
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
