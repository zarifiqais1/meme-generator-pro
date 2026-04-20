import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { auth, loginWithGoogle, logout } from "./firebase";

import { onAuthStateChanged } from "firebase/auth";
import { db } from "./firebase";

export default function App() {
  const [user, setUser] = useState(null);

  const [memes, setMemes] = useState([]);
  const [img, setImg] = useState("");
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [dark, setDark] = useState(false);

  const [fontSize, setFontSize] = useState(30);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("Impact");

  const [pos, setPos] = useState({ x: 250, y: 250 });
  const [dragging, setDragging] = useState(false);

  const [gallery, setGallery] = useState([]);

  const canvasRef = useRef(null);

  // =========================
  // AUTH LISTENER
  // =========================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsub();
  }, []);

  // =========================
  // LOAD MEME API
  // =========================
  useEffect(() => {
    fetch("https://api.imgflip.com/get_memes")
      .then((res) => res.json())
      .then((data) => setMemes(data.data.memes))
      .catch(() => {});
  }, []);

  // =========================
  // LOAD FIRESTORE DATA
  // =========================
  const loadMemes = async () => {
    const snapshot = await getDocs(collection(db, "memes"));

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setGallery(items);
  };

  useEffect(() => {
    loadMemes();
  }, []);

  // =========================
  // DRAW FUNCTION
  // =========================
  const draw = useCallback(
    (imageSrc, top = topText, bottom = bottomText) => {
      if (!imageSrc || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = imageSrc;

      image.onload = () => {
        ctx.clearRect(0, 0, 500, 500);
        ctx.drawImage(image, 0, 0, 500, 500);

        ctx.fillStyle = fontColor;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        ctx.font = `${fontSize}px ${fontFamily}`;

        ctx.fillText(top, 250, 50);
        ctx.strokeText(top, 250, 50);

        ctx.fillText(bottom, pos.x, pos.y);
        ctx.strokeText(bottom, pos.x, pos.y);
      };
    },
    [topText, bottomText, fontSize, fontColor, fontFamily, pos],
  );

  // =========================
  // RANDOM MEME
  // =========================
  const randomMeme = () => {
    if (!memes.length) return;
    const meme = memes[Math.floor(Math.random() * memes.length)];
    setImg(meme.url);
    draw(meme.url);
  };

  const handleGenerate = () => draw(img);

  // =========================
  // DOWNLOAD
  // =========================
  const download = () => {
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // =========================
  // SAVE TO FIRESTORE
  // =========================
  const saveMeme = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    const canvas = canvasRef.current;
    const data = canvas.toDataURL("image/png");

    await addDoc(collection(db, "memes"), {
      img: data,
      userId: user.uid,
      liked: false,
      createdAt: Date.now(),
    });

    loadMemes();
  };

  // =========================
  // DELETE
  // =========================
  const deleteMeme = async (id) => {
    await deleteDoc(doc(db, "memes", id));
    loadMemes();
  };

  // =========================
  // DRAG
  // =========================
  const handleMouseMove = (e) => {
    if (!dragging) return;

    const rect = canvasRef.current.getBoundingClientRect();

    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // =========================
  // REDRAW
  // =========================
  useEffect(() => {
    if (img) draw(img);
  }, [img, draw]);

  return (
    <div className={dark ? "app dark" : "app"}>
      <h1>🔥 Meme Generator PRO (SaaS)</h1>

      {/* AUTH */}
      <div style={{ marginBottom: "10px" }}>
        {user ? (
          <>
            <p>👤 {user.displayName}</p>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <button onClick={loginWithGoogle}>Login with Google</button>
        )}
      </div>

      <button onClick={() => setDark(!dark)}>Toggle Dark Mode</button>

      <div className="inputs">
        <input
          placeholder="Top text"
          value={topText}
          onChange={(e) => setTopText(e.target.value)}
        />

        <input
          placeholder="Bottom text"
          value={bottomText}
          onChange={(e) => setBottomText(e.target.value)}
        />
      </div>

      <div>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          <option value="Impact">Impact</option>
          <option value="Arial">Arial</option>
        </select>

        <input
          type="color"
          value={fontColor}
          onChange={(e) => setFontColor(e.target.value)}
        />

        <input
          type="range"
          min="10"
          max="60"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
        />
      </div>

      <div className="buttons">
        <button onClick={randomMeme}>Random Meme</button>
        <button onClick={handleGenerate}>Generate</button>
        <button onClick={download}>Download</button>
        <button onClick={saveMeme}>Save Cloud</button>
      </div>

      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        onMouseDown={() => setDragging(true)}
        onMouseUp={() => setDragging(false)}
        onMouseMove={handleMouseMove}
      />

      <h2>📸 Cloud Gallery</h2>

      <div className="gallery">
        {gallery.map((item) => (
          <div key={item.id} className="card">
            <img src={item.img} width="120" alt="meme" />

            <div>
              <button onClick={() => deleteMeme(item.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
