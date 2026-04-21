import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

import { auth, loginWithGoogle, logout, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function MemeApp() {
  const navigate = useNavigate();

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

  /* AUTH */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  /* LOAD MEME API */
  useEffect(() => {
    fetch("https://api.imgflip.com/get_memes")
      .then((res) => res.json())
      .then((data) => setMemes(data?.data?.memes || []))
      .catch(console.error);
  }, []);

  /* LOAD FIRESTORE MEMES */
  const loadMemes = useCallback(async () => {
    if (!user) return;

    try {
      const q = query(collection(db, "memes"), where("userId", "==", user.uid));

      const snapshot = await getDocs(q);

      setGallery(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      );
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    loadMemes();
  }, [loadMemes]);

  /* DRAW */
  const draw = useCallback(
    (imageSrc, top = topText, bottom = bottomText) => {
      const canvas = canvasRef.current;
      if (!imageSrc || !canvas) return;

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

  /* RANDOM MEME */
  const randomMeme = () => {
    if (!memes.length) return;
    const meme = memes[Math.floor(Math.random() * memes.length)];
    setImg(meme.url);
    draw(meme.url);
  };

  const handleGenerate = () => draw(img);

  /* DOWNLOAD */
  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  /* SAVE */
  const saveMeme = async () => {
    if (!user) return alert("Please login first");

    const canvas = canvasRef.current;
    if (!canvas) return;

    const data = canvas.toDataURL("image/png");

    await addDoc(collection(db, "memes"), {
      img: data,
      userId: user.uid,
      createdAt: Date.now(),
    });

    loadMemes();
  };

  /* DELETE */
  const deleteMeme = async (id) => {
    await deleteDoc(doc(db, "memes", id));
    loadMemes();
  };

  /* DRAG */
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!dragging || !canvas) return;

    const rect = canvas.getBoundingClientRect();

    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (img) draw(img);
  }, [img, draw]);

  return (
    <div className={dark ? "app dark" : "app"}>
      {/* NAVBAR */}
      <div className="navbar">
        <div className="logo">Meme App</div>

        <div className="nav-links">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/profile")}>Profile</button>
        </div>
      </div>

      <h1>Meme Generator PRO</h1>

      {/* AUTH */}
      <div className="user-box">
        {user ? (
          <>
            <img
              className="avatar"
              src={
                user.photoURL ||
                `https://ui-avatars.com/api/?name=${user.displayName}`
              }
              alt="avatar"
            />

            <div>
              <div>{user.displayName}</div>
              <small>{user.email}</small>
            </div>

            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <button onClick={loginWithGoogle}>Login with Google</button>
        )}
      </div>

      <button onClick={() => setDark(!dark)}>Toggle Dark Mode</button>

      {/* INPUTS */}
      <div>
        <input
          id="topText"
          name="topText"
          placeholder="Top text"
          value={topText}
          onChange={(e) => setTopText(e.target.value)}
        />

        <input
          id="bottomText"
          name="bottomText"
          placeholder="Bottom text"
          value={bottomText}
          onChange={(e) => setBottomText(e.target.value)}
        />
      </div>

      {/* STYLE */}
      <div>
        <select
          name="fontFamily"
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          <option value="Impact">Impact</option>
          <option value="Arial">Arial</option>
        </select>

        <input
          name="fontColor"
          type="color"
          value={fontColor}
          onChange={(e) => setFontColor(e.target.value)}
        />

        <input
          name="fontSize"
          type="range"
          min="10"
          max="60"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
        />
      </div>

      {/* ACTIONS */}
      <div>
        <button onClick={randomMeme}>Random</button>
        <button onClick={handleGenerate}>Generate</button>
        <button onClick={download}>Download</button>
        <button onClick={saveMeme}>Save</button>
      </div>

      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        onMouseDown={() => setDragging(true)}
        onMouseUp={() => setDragging(false)}
        onMouseMove={handleMouseMove}
      />

      {/* GALLERY */}
      <h2>Cloud Gallery</h2>

      <div className="gallery">
        {gallery.map((item) => (
          <div key={item.id} className="card">
            <img src={item.img} width="120" alt="meme" />
            <button onClick={() => deleteMeme(item.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
