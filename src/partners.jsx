import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MarketDashboard from "./components/MarketDashboard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MarketDashboard />
  </StrictMode>,
);
