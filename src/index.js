import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// اضافه کردن فونت Inter به صورت مستقیم برای ظاهر مدرن‌تر (Luxury Look)
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const container = document.getElementById("root");

if (!container) {
  console.error("Root element not found. Check public/index.html");
} else {
  const root = ReactDOM.createRoot(container);

  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}
