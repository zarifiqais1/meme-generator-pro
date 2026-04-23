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
import { onAuthStateChanged, getRedirectResult } from "firebase/auth"; // Added getRedirectResult
import { useNavigate } from "react-router-dom";

export default function MemeApp() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
  const galleryRef = useRef(null);

  /* AUTH LISTENER & REDIRECT HANDLER */
  useEffect(() => {
    // Check for result from redirect login
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect Login Error:", error);
      });

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /* FETCH MEMES FROM API */
  useEffect(() => {
    fetch("https://api.imgflip.com/get_memes")
      .then((res) => res.json())
      .then((data) => {
        const memeData = data?.data?.memes || [];
        setMemes(memeData);
        if (memeData.length > 0 && !img) {
          setImg(memeData[0].url);
          // Initial load of default meme
          setTimeout(() => draw(memeData[0].url), 200);
        }
      })
      .catch(console.error);
  }, []);

  /* LOAD GALLERY FROM FIRESTORE */
  const loadMemes = useCallback(async (uid) => {
    if (!uid) return;
    const q = query(collection(db, "memes"), where("userId", "==", uid));
    const snapshot = await getDocs(q);
    setGallery(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, []);

  useEffect(() => {
    if (user?.uid) loadMemes(user.uid);
  }, [user, loadMemes]);

  /* DRAWING LOGIC - FIXED FOR CORS AND ACCESSIBILITY */
  const draw = useCallback(
    (imageSrc, attempt = 0) => {
      return new Promise((resolve, reject) => {
        if (!imageSrc || !canvasRef.current) return reject("No source");
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const image = new Image();

        // Use timestamps to bypass browser cache and avoid repeated CORS errors
        const cacheBuster = imageSrc.includes("?")
          ? `&t=${Date.now()}`
          : `?t=${Date.now()}`;
        const cleanSrc = imageSrc + cacheBuster;

        let finalUrl = cleanSrc;

        // Multi-level fallback to bypass CORS
        if (attempt === 1) {
          finalUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanSrc)}`;
        } else if (attempt === 2) {
          finalUrl = `https://corsproxy.io/?${encodeURIComponent(cleanSrc)}`;
        }

        image.crossOrigin = "anonymous";
        image.src = finalUrl;

        image.onload = () => {
          ctx.clearRect(0, 0, 500, 500);
          ctx.drawImage(image, 0, 0, 500, 500);
          ctx.fillStyle = fontColor;
          ctx.strokeStyle = "black";
          ctx.lineWidth = 3;
          ctx.textAlign = "center";
          ctx.font = `${fontSize}px ${fontFamily}`;

          ctx.fillText(topText, 250, 50);
          ctx.strokeText(topText, 250, 50);

          ctx.fillText(bottomText, pos.x, pos.y);
          ctx.strokeText(bottomText, pos.x, pos.y);
          resolve();
        };

        image.onerror = () => {
          if (attempt < 2) {
            // Automatically retry with a different proxy if it fails
            draw(imageSrc, attempt + 1)
              .then(resolve)
              .catch(reject);
          } else {
            reject("Image load failed after multiple attempts.");
          }
        };
      });
    },
    [topText, bottomText, fontSize, fontColor, fontFamily, pos],
  );

  /* LIVE TEXT UPDATE ON LOADED IMAGE */
  useEffect(() => {
    if (img && canvasRef.current) {
      draw(img).catch(() => {});
    }
  }, [topText, bottomText, fontSize, fontColor, fontFamily, pos, draw]);

  const randomMeme = () => {
    if (!memes.length) return;
    const meme = memes[Math.floor(Math.random() * memes.length)];
    setImg(meme.url);
    draw(meme.url).catch(() => {});
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  /* SEARCH/LOAD BUTTON - TRIGGER LOADING MANUALLY */
  const handleLoadImage = (e) => {
    if (e) e.preventDefault();
    if (!img) return alert("Please paste a URL first");
    draw(img).catch(() =>
      alert("Error: This image host is strictly protected. Try another link."),
    );
  };

  /* SAVE TO FIRESTORE */
  const handleSaveMeme = async () => {
    if (!user?.uid) return alert("Please login first to save memes");
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const data = canvas.toDataURL("image/png");
      await addDoc(collection(db, "memes"), {
        img: data,
        userId: user.uid,
        createdAt: Date.now(),
      });

      await loadMemes(user.uid);
      galleryRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      alert("Error saving meme to gallery.");
    }
  };

  const deleteMeme = async (id) => {
    await deleteDoc(doc(db, "memes", id));
    if (user?.uid) loadMemes(user.uid);
  };

  const handleMouseMove = (e) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  if (loading)
    return (
      <div className="loading">
        <h2>Loading App...</h2>
      </div>
    );

  return (
    <div className={dark ? "app dark" : "app"}>
      <nav className="navbar">
        <div className="logo">Meme App</div>
        <div className="nav-links">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/profile")}>Profile</button>
        </div>
      </nav>

      <div className="main-content">
        <h1>Meme Generator PRO</h1>

        <div className="user-box">
          {user ? (
            <div className="user-info-mini">
              <img className="avatar" src={user.photoURL || ""} alt="avatar" />
              <div>
                <strong>{user.displayName}</strong>
                <button className="logout-btn-text" onClick={logout}>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button className="login-btn-small" onClick={loginWithGoogle}>
              Login with Google
            </button>
          )}
        </div>

        <button className="theme-toggle" onClick={() => setDark(!dark)}>
          {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        <form className="meme-form" onSubmit={handleLoadImage}>
          <div className="inputs-container">
            <input
              id="topText"
              name="topText"
              required
              placeholder="Top Text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
            />
            <input
              id="bottomText"
              name="bottomText"
              required
              placeholder="Bottom Text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
            />
            <input
              id="imgUrl"
              name="imgUrl"
              placeholder="Paste ANY Image URL here..."
              value={img}
              onChange={(e) => setImg(e.target.value)}
            />
          </div>

          <div className="settings-container">
            <select
              id="fontFamily"
              name="fontFamily"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              <option value="Impact">Impact</option>
              <option value="Arial">Arial</option>
            </select>
            <input
              id="fontColor"
              name="fontColor"
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
            />
            <input
              id="fontSize"
              name="fontSize"
              type="range"
              min="10"
              max="70"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </div>

          <div className="buttons-container">
            <button type="button" onClick={randomMeme}>
              Random Image
            </button>
            <button type="submit" className="primary-btn">
              Add Meme (Search)
            </button>
            <button
              type="button"
              onClick={handleSaveMeme}
              style={{ backgroundColor: "#28a745", color: "white" }}
            >
              Save to Cloud
            </button>
            <button type="button" onClick={download}>
              Download
            </button>
          </div>
        </form>

        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            width="500"
            height="500"
            onMouseDown={() => setDragging(true)}
            onMouseUp={() => setDragging(false)}
            onMouseMove={handleMouseMove}
            style={{
              cursor: dragging ? "grabbing" : "crosshair",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <h2 ref={galleryRef}>Cloud Gallery</h2>
        <div className="gallery-container">
          {gallery.length > 0 ? (
            gallery.map((item) => (
              <div
                key={item.id}
                className="gallery-item"
                onClick={() => deleteMeme(item.id)}
              >
                <img src={item.img} alt="meme" />
                <div className="delete-hint">✕ Click to Delete</div>
              </div>
            ))
          ) : (
            <p>Your collection is empty.</p>
          )}
        </div>
      </div>
    </div>
  );
}
