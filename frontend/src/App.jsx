import React, { useEffect, useState } from "react";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { api } from "./lib/api.js";
import { COLORS } from "./lib/theme.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [screen, setScreen] = useState("signin"); // "signin" | "signup"

  // On load, if a token is already stored, try to restore the session
  // instead of forcing a fresh sign-in every reload.
  useEffect(() => {
    const token = localStorage.getItem("dayflow_token");
    if (!token) {
      setCheckingSession(false);
      return;
    }
    api.me()
      .then((r) => setUser(r.user))
      .catch(() => localStorage.removeItem("dayflow_token"))
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: COLORS.paper }}>
        <p className="text-sm" style={{ color: COLORS.muted }}>Loading…</p>
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} onLogout={() => setUser(null)} />;
  }

  return screen === "signin" ? (
    <SignIn onSignedIn={setUser} onSwitchToSignUp={() => setScreen("signup")} />
  ) : (
    <SignUp onSignedUp={() => {}} onSwitchToSignIn={() => setScreen("signin")} />
  );
}
