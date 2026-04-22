import { useEffect, useState } from "react";
import { db, auth, logout } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadMemes = async () => {
      if (!user?.uid) return;
      const q = query(collection(db, "memes"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      setMemes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    loadMemes();
  }, [user]);

  // تابع کمکی برای مدیریت خطای عکس و نمایش آواتار جایگزین
  const handleAvatarError = (e) => {
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "U")}&background=0D8ABC&color=fff&bold=true`;
  };

  if (loading) {
    return (
      <h2
        style={{ textAlign: "center", marginTop: 50, fontFamily: "sans-serif" }}
      >
        Loading...
      </h2>
    );
  }

  if (!user) {
    return (
      <div
        style={{ textAlign: "center", marginTop: 50, fontFamily: "sans-serif" }}
      >
        <h2>Please login first</h2>
        <button onClick={() => navigate("/login")} style={styles.backBtn}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", color: "#111" }}>
            Profile
          </h1>
          <p style={{ margin: "5px 0 0", color: "#666" }}>
            Your account dashboard
          </p>
        </div>
        <button
          style={styles.logoutBtn}
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      <div style={styles.mainGrid}>
        {/* USER INFO */}
        <div style={styles.card}>
          <div style={styles.cardLabel}>USER INFO</div>
          <div style={styles.userInfoBox}>
            <img
              style={styles.avatar}
              src={
                user.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "User")}&background=random`
              }
              alt="avatar"
              onError={handleAvatarError}
            />
            <div style={styles.userText}>
              <div style={styles.userName}>
                {user.displayName || "Unknown User"}
              </div>
              <div style={styles.userEmail}>{user.email}</div>
              <div style={styles.badge}>Active Creator</div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div style={styles.card}>
          <div style={styles.cardLabel}>STATS</div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{memes.length}</div>
            <div style={styles.statLabel}>Total Memes</div>
          </div>
        </div>
      </div>

      {/* MEMES GALLERY */}
      <h3
        style={{
          marginTop: 40,
          marginBottom: 20,
          fontSize: "22px",
          color: "#111",
        }}
      >
        Your Memes
      </h3>
      <div style={styles.gallery}>
        {memes.length > 0 ? (
          memes.map((m) => (
            <div key={m.id} style={styles.memeCard}>
              <img src={m.img} alt="meme" style={styles.memeImg} />
            </div>
          ))
        ) : (
          <p style={{ color: "#888" }}>No memes saved yet.</p>
        )}
      </div>

      {/* BACK BUTTON */}
      <div
        style={{
          marginTop: "40px",
          borderTop: "1px solid #eee",
          paddingTop: "20px",
        }}
      >
        <button style={styles.backBtn} onClick={() => navigate("/")}>
          ← Back to Editor
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  logoutBtn: {
    padding: "10px 20px",
    backgroundColor: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    border: "1px solid #eee",
  },
  cardLabel: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#888",
    letterSpacing: "1px",
    marginBottom: "15px",
  },
  userInfoBox: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: "3px solid #f8f9fa",
    objectFit: "cover",
  },
  userText: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    overflow: "hidden",
  },
  userName: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111",
  },
  userEmail: {
    fontSize: "14px",
    color: "#666",
    wordBreak: "break-all",
  },
  badge: {
    marginTop: "8px",
    fontSize: "11px",
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    padding: "4px 10px",
    borderRadius: "20px",
    width: "fit-content",
    fontWeight: "bold",
  },
  statContent: {
    textAlign: "center",
    padding: "10px 0",
  },
  statNumber: {
    fontSize: "40px",
    fontWeight: "800",
    color: "#111",
  },
  statLabel: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "500",
  },
  gallery: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "15px",
  },
  memeCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    border: "1px solid #eee",
  },
  memeImg: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    display: "block",
  },
  backBtn: {
    padding: "12px 24px",
    backgroundColor: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
  },
};
