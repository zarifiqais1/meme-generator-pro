import { useEffect, useState } from "react";
import { auth, logout, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

/* =========================
   PROFILE PAGE (REAL)
========================= */
export function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Please login first</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>👤 Profile</h1>

      <div style={{ marginTop: 10 }}>
        <p>
          <b>Name:</b> {user.displayName}
        </p>
        <p>
          <b>Email:</b> {user.email}
        </p>
        <p>
          <b>User ID:</b> {user.uid}
        </p>
      </div>

      <button onClick={logout} style={{ marginTop: 10 }}>
        Logout
      </button>
    </div>
  );
}

/* =========================
   PUBLIC MEME PAGE (REAL)
========================= */
export function PublicMeme() {
  const [meme, setMeme] = useState(null);

  // get id from URL
  const id = window.location.pathname.split("/").pop();

  useEffect(() => {
    const loadMeme = async () => {
      try {
        const ref = doc(db, "memes", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setMeme(snap.data());
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadMeme();
  }, [id]);

  if (!meme) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Loading meme...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>🌍 Shared Meme</h1>

      <img src={meme.img} alt="meme" style={{ width: 300, borderRadius: 10 }} />

      <p style={{ marginTop: 10 }}>Created by: {meme.userId}</p>

      <button
        onClick={() => navigator.clipboard.writeText(window.location.href)}
        style={{ marginTop: 10 }}
      >
        Copy Link
      </button>
    </div>
  );
}
