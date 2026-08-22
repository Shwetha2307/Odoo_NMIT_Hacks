import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

function computeNet(user) {
  const base = Number(user.baseSalary || 0);
  const allowances = Number(user.allowances || 0);
  const deductions = Number(user.deductions || 0);
  return { base, allowances, deductions, net: base + allowances - deductions };
}

// GET /api/payroll/me — read-only view for the logged-in employee
router.get("/me", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { baseSalary: true, allowances: true, deductions: true },
  });
  res.json({ payroll: computeNet(user) });
});

// GET /api/payroll — admin view of everyone's payroll
router.get("/", requireRole("ADMIN"), async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, employeeId: true, baseSalary: true, allowances: true, deductions: true },
  });
  const payroll = users.map((u) => ({ id: u.id, name: u.name, employeeId: u.employeeId, ...computeNet(u) }));
  res.json({ payroll });
});

// PATCH /api/payroll/:id — admin updates an employee's salary structure
router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const { baseSalary, allowances, deductions } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { baseSalary, allowances, deductions },
    select: { id: true, name: true, baseSalary: true, allowances: true, deductions: true },
  });
  res.json({ payroll: { ...user, ...computeNet(user) } });
});

export default router;
