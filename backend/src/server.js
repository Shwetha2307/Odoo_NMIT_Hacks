import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/payroll", payrollRoutes);

// Central error handler — keeps stray throws from crashing the process
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our end" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Dayflow API running on http://localhost:${PORT}`));
