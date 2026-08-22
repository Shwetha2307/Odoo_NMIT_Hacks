const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("dayflow_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("dayflow_token", token);
  else localStorage.removeItem("dayflow_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Try again.");
  }
  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload, auth: false }),
  signin: (payload) => request("/auth/signin", { method: "POST", body: payload, auth: false }),

  me: () => request("/employees/me"),
  updateMe: (payload) => request("/employees/me", { method: "PATCH", body: payload }),
  listEmployees: () => request("/employees"),

  checkIn: () => request("/attendance/checkin", { method: "POST" }),
  checkOut: () => request("/attendance/checkout", { method: "POST" }),
  myAttendance: (from, to) => request(`/attendance/me?from=${from}&to=${to}`),
  teamAttendance: (date) => request(`/attendance?date=${date}`),

  applyLeave: (payload) => request("/leave", { method: "POST", body: payload }),
  myLeaves: () => request("/leave/me"),
  pendingLeaves: () => request("/leave?status=PENDING"),
  resolveLeave: (id, status, comment) =>
    request(`/leave/${id}`, { method: "PATCH", body: { status, comment } }),

  myPayroll: () => request("/payroll/me"),
  allPayroll: () => request("/payroll"),
  updatePayroll: (id, payload) => request(`/payroll/${id}`, { method: "PATCH", body: payload }),
};
