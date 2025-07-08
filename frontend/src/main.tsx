import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { BetProvider } from "./context/BetContext";

/* ---------- one BrowserRouter that wraps the whole app ---------- */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <BetProvider>
        <App />
      </BetProvider>
    </BrowserRouter>
  </React.StrictMode>
);
