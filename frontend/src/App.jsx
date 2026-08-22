import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/employee/dashboard"
        element={<Dashboard initialRole="employee" />}
      />
      <Route path="/hr/dashboard" element={<Dashboard initialRole="admin" />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
