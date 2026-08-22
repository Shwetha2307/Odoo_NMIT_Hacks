/**
 * authService.js
 *
 * Thin abstraction over the authentication API. The UI only ever talks to
 * `login()` below — it never knows whether the response came from a real
 * backend or the development mock.
 *
 * ---------------------------------------------------------------------
 * WIRING UP THE REAL BACKEND
 * ---------------------------------------------------------------------
 * Replace the body of `login()` with a real network call:
 *
 *   const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ email, password }),
 *   });
 *
 *   if (!response.ok) {
 *     if (response.status === 401) {
 *       throw new AuthError("Invalid email or password.");
 *     }
 *     throw new AuthError("Unable to connect to the server. Please try again.");
 *   }
 *
 *   return response.json(); // { token, user: { id, email, role } }
 *
 * The expected success shape from the backend is:
 *   {
 *     "token": "...",
 *     "user": { "id": "...", "email": "...", "role": "EMPLOYEE" | "HR" }
 *   }
 *
 * Until that endpoint exists, USE_MOCK_AUTH below controls whether this
 * file serves demo credentials instead of calling the network.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Flip to false the moment a real backend is available.
const USE_MOCK_AUTH = true;

export class AuthError extends Error {}

// Development-only demo accounts. Never referenced directly by UI
// components — only this service knows they exist, and only when
// USE_MOCK_AUTH is true.
const DEV_MOCK_ACCOUNTS = [
  {
    email: "employee@dayflow.com",
    password: "employee123",
    user: { id: "usr_emp_001", email: "employee@dayflow.com", role: "EMPLOYEE" },
  },
  {
    email: "hr@dayflow.com",
    password: "hr1234",
    user: { id: "usr_hr_001", email: "hr@dayflow.com", role: "HR" },
  },
];

function mockLogin(email, password) {
  return new Promise((resolve, reject) => {
    // Simulated network latency so the loading state is visible in the demo.
    setTimeout(() => {
      const match = DEV_MOCK_ACCOUNTS.find(
        (account) =>
          account.email.toLowerCase() === email.toLowerCase() &&
          account.password === password
      );

      if (!match) {
        reject(new AuthError("Invalid email or password."));
        return;
      }

      resolve({
        token: `dev-mock-token-${match.user.id}`,
        user: match.user,
      });
    }, 700);
  });
}

async function realLogin(email, password) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new AuthError("Unable to connect to the server. Please try again.");
  }

  if (response.status === 401) {
    throw new AuthError("Invalid email or password.");
  }

  if (!response.ok) {
    throw new AuthError("Unable to connect to the server. Please try again.");
  }

  return response.json();
}

/**
 * Authenticate a user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: { id: string, email: string, role: "EMPLOYEE" | "HR" | "ADMIN" } }>}
 */
export function login(email, password) {
  return USE_MOCK_AUTH ? mockLogin(email, password) : realLogin(email, password);
}

/**
 * Resolve the dashboard route for a given role. Treats "ADMIN" the same
 * way as "HR" so either naming convention works with the backend.
 */
export function getDashboardRouteForRole(role) {
  const normalized = String(role || "").toUpperCase();
  if (normalized === "HR" || normalized === "ADMIN") {
    return "/hr/dashboard";
  }
  return "/employee/dashboard";
}
