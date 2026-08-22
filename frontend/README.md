# Dayflow frontend

React + Vite + Tailwind + Recharts, wired to the Dayflow Express API.

## Setup

```bash
npm install
cp .env.example .env      # point VITE_API_URL at your running backend
npm run dev                # http://localhost:5173
```

Requires the `dayflow-backend` API running (see its README) with at least
one signed-up user. Sign up as `ADMIN` once to see the HR view, and as
`EMPLOYEE` for the personal dashboard — same codebase, different data.

## What's live vs. still a stub

- Sign up / sign in hit the real `/api/auth` endpoints and store a JWT in
  `localStorage`. Session is restored on page reload via `GET /employees/me`.
- Check in / check out, the weekly flow chart, leave applications, and the
  admin approve/reject actions all read and write through `src/lib/api.js` —
  no mock arrays left.
- Salary editing UI isn't built yet (`PATCH /payroll/:id` exists on the
  backend, ready to wire up when you add that screen).
- Profile editing (phone/address/photo) has an endpoint (`PATCH /employees/me`)
  but no form yet — natural next addition.
