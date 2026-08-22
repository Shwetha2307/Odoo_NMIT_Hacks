import React, { useEffect, useState } from "react";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { api } from "./lib/api.js";

export default function App() {
  const [screen, setScreen] = useState("signin"); // signin | signup
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // On load, if a token is already stored, try to restore the session
  // instead of forcing a fresh sign in every time.
  useEffect(() => {
    const token = localStorage.getItem("dayflow_token");
    if (!token) {
      setCheckingSession(false);
      return;
    }
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) return null;

  if (user) {
    return <Dashboard user={user} onLogout={() => setUser(null)} />;
  }

  if (screen === "signup") {
    return <SignUp onSwitchToSignIn={() => setScreen("signin")} />;
  }

  return (
    <SignIn
      onSignedIn={(signedInUser) => setUser(signedInUser)}
      onSwitchToSignUp={() => setScreen("signup")}
    />
  );
}
