import { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
  const [memes, setMemes] = useState([]);
  const [img, setImg] = useState("");
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [dark, setDark] = useState(false);

  const [fontSize, setFontSize] = useState(30);
  const [fontColor, setFontColor] = useState("#ffffff");

  const [pos, setPos] = useState({ x: 250, y: 250 });
  const [dragging, setDragging] = useState(false);

  // SAFE LOCAL STORAGE
  const [gallery, setGallery] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gallery") || "[]");
    } catch {
      return [];
    }
  });

  const canvasRef = useRef(null);

  useEffect(() => {
    fetch("https://api.imgflip.com/get_memes")
      .then((res) => res.json())
      .then((data) => setMemes(data.data.memes))
      .catch(() => {});
  }, []);

  const draw = (imageSrc, top = topText, bottom = bottomText) => {
    if (!imageSrc) return;

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
      ctx.font = `${fontSize}px Impact`;

      ctx.fillText(top, 250, 50);
      ctx.strokeText(top, 250, 50);

      ctx.fillText(bottom, pos.x, pos.y);
      ctx.strokeText(bottom, pos.x, pos.y);
    };
  };

  const randomMeme = () => {
    if (!memes.length) return;
    const meme = memes[Math.floor(Math.random() * memes.length)];
    setImg(meme.url);
    draw(meme.url);
  };

  const handleGenerate = () => {
    draw(img);
  };

  const download = () => {
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const saveMeme = () => {
    const canvas = canvasRef.current;
    const data = canvas.toDataURL("image/png");

    const newItem = {
      id: Date.now(),
      img: data,
      liked: false,
    };

    const updated = [newItem, ...gallery];
    setGallery(updated);
    localStorage.setItem("gallery", JSON.stringify(updated));
  };

  const deleteMeme = (id) => {
    const updated = gallery.filter((item) => item.id !== id);
    setGallery(updated);
    localStorage.setItem("gallery", JSON.stringify(updated));
  };

  const toggleLike = (id) => {
    const updated = gallery.map((item) =>
      item.id === id ? { ...item, liked: !item.liked } : item,
    );

    setGallery(updated);
    localStorage.setItem("gallery", JSON.stringify(updated));
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const rect = canvasRef.current.getBoundingClientRect();

    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (img) draw(img);
  }, [topText, bottomText, fontSize, fontColor, pos]);

  return (
    <div className={dark ? "app dark" : "app"}>
      <h1>🔥 Meme Generator PRO</h1>

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
        <select onChange={() => draw(img)}>
          <option>Impact</option>
          <option>Arial</option>
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
        <button onClick={saveMeme}>Save</button>
      </div>

      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        onMouseDown={() => setDragging(true)}
        onMouseUp={() => setDragging(false)}
        onMouseMove={handleMouseMove}
      />

      <h2>📸 Saved Memes</h2>

      <div className="gallery">
        {gallery.map((item) => (
          <div key={item.id} className="card">
            <img src={item.img} width="120" alt="saved meme" />

            <div>
              <button onClick={() => toggleLike(item.id)}>
                {item.liked ? "❤️" : "🤍"}
              </button>

              <button onClick={() => deleteMeme(item.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
