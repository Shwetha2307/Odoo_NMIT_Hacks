# Dayflow backend

Express + PostgreSQL + Prisma + JWT API for the Dayflow HRMS.

## Setup

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run dev                 # http://localhost:4000
```

Need a quick local Postgres instance? `docker run --name dayflow-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dayflow -p 5432:5432 -d postgres` then point `DATABASE_URL` at it.

## Endpoints

| Method | Path                     | Access         | Purpose                          |
| ------ | ------------------------ | -------------- | --------------------------------- |
| POST   | /api/auth/signup         | Public         | Register (Employee ID, email, password, role) |
| POST   | /api/auth/signin         | Public         | Log in, returns JWT               |
| GET    | /api/employees/me        | Auth           | Your own profile                  |
| PATCH  | /api/employees/me        | Auth           | Edit phone/address/photo only     |
| GET    | /api/employees           | Admin          | List all employees                |
| GET    | /api/employees/:id       | Admin          | One employee's full profile       |
| PATCH  | /api/employees/:id       | Admin          | Edit any field, incl. salary/role |
| POST   | /api/attendance/checkin  | Auth           | Clock in for today                |
| POST   | /api/attendance/checkout | Auth           | Clock out for today               |
| GET    | /api/attendance/me       | Auth           | Your attendance history           |
| GET    | /api/attendance          | Admin          | Everyone's attendance for a date  |
| POST   | /api/leave               | Auth           | Apply for leave                   |
| GET    | /api/leave/me             | Auth           | Your leave requests               |
| GET    | /api/leave                | Admin          | Requests by status (default PENDING) |
| PATCH  | /api/leave/:id            | Admin          | Approve/reject with a comment     |
| GET    | /api/payroll/me           | Auth           | Your salary breakdown (read-only) |
| GET    | /api/payroll              | Admin          | Everyone's payroll                |
| PATCH  | /api/payroll/:id          | Admin          | Update salary structure           |

Every authenticated route expects `Authorization: Bearer <token>`.

## Notes on things left as stubs

- **Email verification** on signup sets `isEmailVerified: false` but doesn't send anything yet — wire up Nodemailer in `auth.routes.js` where marked.
- **Attendance status auto-derivation** (present/half-day) happens on checkout based on hours worked; tune the threshold in `attendance.routes.js`.
- Approving a leave request automatically marks the corresponding days as `LEAVE` in attendance, so the two stay in sync.
