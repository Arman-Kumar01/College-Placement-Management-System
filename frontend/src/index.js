import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";   // 👈 App.js default export import
import "./index.css";      

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

