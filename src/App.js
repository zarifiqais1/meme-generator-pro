import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, loginWithGoogle } from "./firebase";

import MemeApp from "./MemeApp";
import Profile from "./pages/Profile";

// بخش انیمیشن و دیزاین مدرن لاگین
function Login({ user, loading }) {
  if (loading)
    return (
      <div style={styles.loadingScreen}>
        <h2>Loading...</h2>
      </div>
    );

  if (user) return <Navigate to="/" replace />;

  return (
    <div style={styles.loginContainer}>
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-in { animation: fadeInUp 0.8s ease-out forwards; }
          .btn-hover:hover { transform: scale(1.02); background-color: #f0f0f0 !important; }
        `}
      </style>

      <div className="animate-in" style={styles.loginCard}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>PRO</div>
          <h1 style={styles.mainTitle}>Meme Generator</h1>
          <p style={styles.welcomeMsg}>
            Welcome to the next generation of meme creation.
          </p>
        </div>

        <div style={styles.featuresBox}>
          <div style={styles.featureLine}>
            ✨ Create stunning memes in seconds
          </div>
          <div style={styles.featureLine}>
            ☁️ Auto-save to your personal cloud
          </div>
          <div style={styles.featureLine}>
            🔓 Access exclusive designer fonts
          </div>
        </div>

        <div style={styles.actionSection}>
          <button
            className="btn-hover"
            onClick={loginWithGoogle}
            style={styles.googleButton}
          >
            <img
              src="https://img.icons8.com/color/48/google-logo.png"
              alt="google"
              style={{ width: 24, height: 24 }}
            />
            Sign in with Google
          </button>
          <p style={styles.footerText}>Secure authentication by Google</p>
        </div>
      </div>
    </div>
  );
}

function PrivateRoute({ user, loading, children }) {
  if (loading)
    return (
      <div style={styles.loadingScreen}>
        <h2>Loading...</h2>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // افزودن auth به وابستگی‌ها برای جلوگیری از خطای ESLint در Vercel
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  if (!authReady) {
    return (
      <div style={styles.loadingScreen}>
        <h2>Initializing...</h2>
      </div>
    );
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

const styles = {
  loginContainer: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "radial-gradient(circle at center, #1a1a1a 0%, #000 100%)",
    fontFamily: "'Inter', sans-serif",
    color: "#fff",
    padding: "20px",
  },
  loginCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(15px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "30px",
    padding: "50px 40px",
    width: "100%",
    maxWidth: "450px",
    textAlign: "center",
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  },
  header: { marginBottom: "40px" },
  logoBadge: {
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: "8px",
    border: "1px solid #ffd700",
    color: "#ffd700",
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  mainTitle: {
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 0 10px 0",
    letterSpacing: "-1px",
  },
  welcomeMsg: { fontSize: "15px", color: "#888", lineHeight: "1.6" },
  featuresBox: {
    textAlign: "left",
    background: "rgba(255,255,255,0.02)",
    padding: "20px",
    borderRadius: "20px",
    marginBottom: "40px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  featureLine: {
    fontSize: "14px",
    color: "#ccc",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
  },
  actionSection: { display: "flex", flexDirection: "column", gap: "15px" },
  googleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#fff",
    color: "#000",
    border: "none",
    borderRadius: "15px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  footerText: { fontSize: "12px", color: "#555" },
  loadingScreen: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    color: "#fff",
    fontFamily: "sans-serif",
  },
};
