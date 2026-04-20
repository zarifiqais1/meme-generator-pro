import { useEffect, useState } from "react";
import { db, auth, logout } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [memes, setMemes] = useState([]);

  /* AUTH */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  /* LOAD MEMES */
  useEffect(() => {
    const load = async () => {
      if (!user) return;

      const q = query(collection(db, "memes"), where("userId", "==", user.uid));

      const snap = await getDocs(q);

      setMemes(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      );
    };

    load();
  }, [user]);

  if (!user) {
    return (
      <div className="profile-container">
        <h2>Please login first</h2>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* HEADER */}
      <div className="profile-header">
        <div>
          <h1 className="title">Profile</h1>
          <p className="subtitle">Your account dashboard</p>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* GRID TOP */}
      <div className="profile-grid-2">
        {/* USER INFO */}
        <div className="card profile-card">
          <h3 className="card-title">👤 User Info</h3>

          <div className="info-grid">
            <div className="info-item">
              <span className="label">Name</span>
              <span className="value">{user.displayName}</span>
            </div>

            <div className="info-item">
              <span className="label">Email</span>
              <span className="value">{user.email}</span>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="card stats-card">
          <h3 className="card-title">📊 Stats</h3>

          <div className="stat-box">
            <div className="stat-number">{memes.length}</div>
            <div className="stat-label">Total Memes</div>
          </div>
        </div>
      </div>

      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => navigate("/")}>
        ← Back to Meme Generator
      </button>

      {/* MEMES */}
      <h3 className="section-title">Your Memes</h3>

      <div className="profile-grid">
        {memes.map((m) => (
          <div key={m.id} className="meme-card">
            <img src={m.img} alt="meme" />
          </div>
        ))}
      </div>
    </div>
  );
}
