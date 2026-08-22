import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../utils/jwt.js";

const router = Router();

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { employeeId, email, password, name, role } = req.body;

  if (!employeeId || !email || !password || !name) {
    return res.status(400).json({ error: "employeeId, email, password and name are required" });
  }
  if (!PASSWORD_RULE.test(password)) {
    return res.status(400).json({
      error: "Password needs at least 8 characters, one uppercase, one lowercase and one number",
    });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { employeeId }] },
  });
  if (existing) {
    return res.status(409).json({ error: "That email or employee ID is already registered" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      employeeId,
      email,
      password: hashed,
      name,
      role: role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
      // Wire up a real email provider (Nodemailer) here to send a
      // verification link and flip isEmailVerified once confirmed.
      isEmailVerified: false,
    },
    select: { id: true, employeeId: true, email: true, name: true, role: true },
  });

  res.status(201).json({ user });
});

// POST /api/auth/signin
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, employeeId: user.employeeId, name: user.name, role: user.role, email: user.email },
  });
});

export default router;
