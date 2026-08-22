# Dayflow — Frontend

Single Vite + React app for the Dayflow HR Management System: login screen
+ Employee/HR dashboard, sharing one design system (Tailwind tokens: `ink`,
`paper`, `flow`, `tide`, `coral`, `mist`; fonts: Inter, Space Grotesk,
JetBrains Mono).

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL — you'll land on `/login`.

## Structure

```
src/
  components/auth/   Login page building blocks (form, password field, alert, branding)
  pages/
    Login.jsx         /login
    Dashboard.jsx      /employee/dashboard and /hr/dashboard (role-aware)
  services/
    authService.js    login() abstraction — mock now, real API later
  App.jsx              routes
```

## Demo credentials (mock auth)

Mock authentication lives in `src/services/authService.js`, isolated
behind a `USE_MOCK_AUTH` flag — the UI never references these credentials
directly.

| Role     | Email                 | Password    |
|----------|------------------------|-------------|
| Employee | employee@dayflow.com  | employee123 |
| HR/Admin | hr@dayflow.com        | hr123       |

A successful login redirects to `/employee/dashboard` or `/hr/dashboard`
and seeds `Dashboard.jsx`'s starting view accordingly. Wrong credentials
show "Invalid email or password." Logging out from the dashboard sends
you back to `/login`.

## Connecting the real backend

In `src/services/authService.js`:

1. Set `USE_MOCK_AUTH = false`.
2. Point `API_BASE_URL` at your API (via `VITE_API_BASE_URL` env var, or hard-code it).
3. `realLogin()` already implements the `POST /api/auth/login` call and
   error handling — nothing else in the app needs to change.

Expected backend response:

```json
{
  "token": "...",
  "user": { "id": "...", "email": "...", "role": "EMPLOYEE" }
}
```

`role` of `"HR"` or `"ADMIN"` both route to `/hr/dashboard`; anything else
routes to `/employee/dashboard` (see `getDashboardRouteForRole` in
`authService.js`).
