import React from "react";
import { createRoot } from "react-dom/client";
import "@/styles/print-base.css";
import "@/styles/list-print.css";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
