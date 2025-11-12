// src/main.jsx
import "./index.css"; // 👈 must be first, this loads Tailwind
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// optional: react-router-dom is imported inside App.jsx
// so we don't import BrowserRouter here again

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
