import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

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
