import React, { useEffect, useState } from "react";
import { COLORS } from "../lib/theme.js";
import { api } from "../lib/api.js";
import { Card, Pill, Table } from "../components/ui.jsx";

export default function Team() {
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
