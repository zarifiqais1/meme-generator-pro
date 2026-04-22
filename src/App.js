import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, loginWithGoogle } from "./firebase";

import MemeApp from "./MemeApp";
import Profile from "./pages/Profile";

function Login({ user, loading }) {
  if (loading) return <h2>Loading...</h2>;

  if (user) return <Navigate to="/" replace />;

  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h1>Login</h1>

      <button onClick={loginWithGoogle}>Login with Google</button>
    </div>
  );
}

function PrivateRoute({ user, loading, children }) {
  if (loading) return <h2>Loading...</h2>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  /* ======================
     AUTH LISTENER (STABLE)
  ====================== */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      setAuthReady(true);
    });

    return () => unsub();
  }, []);

  /* ======================
     BLOCK RENDER UNTIL AUTH READY
  ====================== */
  if (!authReady) {
    return <h2>Initializing...</h2>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login user={user} loading={loading} />} />

      <Route
        path="/"
        element={
          <PrivateRoute user={user} loading={loading}>
            <MemeApp />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute user={user} loading={loading}>
            <Profile />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
