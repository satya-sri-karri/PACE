import React from "react";
import { hydrateRoot } from "react-dom/client";
import Home from "../app/page";
import "../app/globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("PACE root element is missing.");
hydrateRoot(
  root,
  <React.StrictMode>
    <Home />
  </React.StrictMode>,
);
