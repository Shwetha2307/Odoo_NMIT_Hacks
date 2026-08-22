import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const PUBLIC_FIELDS = {
  id: true,
  employeeId: true,
  email: true,
  name: true,
  role: true,
  isEmailVerified: true,
  phone: true,
  address: true,
  photoUrl: true,
  jobTitle: true,
  department: true,
  dateOfJoining: true,
  baseSalary: true,
  allowances: true,
  deductions: true,
  createdAt: true,
};

// GET /api/employees/me
router.get("/me", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: PUBLIC_FIELDS,
  });
  if (!user) return res.status(404).json({ error: "Account not found" });
  res.json({ user });
});

// PATCH /api/employees/me — employees may only touch these three fields
router.patch("/me", async (req, res) => {
  const { phone, address, photoUrl } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { phone, address, photoUrl },
    select: PUBLIC_FIELDS,
  });
  res.json({ user });
});

// GET /api/employees — admin only, list everyone
router.get("/", requireRole("ADMIN"), async (req, res) => {
  const users = await prisma.user.findMany({
    select: PUBLIC_FIELDS,
    orderBy: { name: "asc" },
  });
  res.json({ users });
});

// GET /api/employees/:id — admin only, one employee's full profile
router.get("/:id", requireRole("ADMIN"), async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: PUBLIC_FIELDS,
  });
  if (!user) return res.status(404).json({ error: "Employee not found" });
  res.json({ user });
});

// PATCH /api/employees/:id — admin only, can edit any field incl. salary/role
router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const {
    name, phone, address, photoUrl, jobTitle, department,
    dateOfJoining, role, baseSalary, allowances, deductions,
  } = req.body;

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      name, phone, address, photoUrl, jobTitle, department,
      role: role === "ADMIN" ? "ADMIN" : role === "EMPLOYEE" ? "EMPLOYEE" : undefined,
      dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
      baseSalary, allowances, deductions,
    },
    select: PUBLIC_FIELDS,
  });
  res.json({ user });
});

export default router;
