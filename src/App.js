import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, loginWithGoogle } from "./firebase";

import MemeApp from "./MemeApp";
import Profile from "./pages/Profile";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    await loginWithGoogle();
    navigate("/"); // 🔥 مهم‌ترین fix
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Login Required</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
}

function PrivateRoute({ user, children }) {
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <h2>Loading...</h2>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute user={user}>
            <MemeApp />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute user={user}>
            <Profile />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
