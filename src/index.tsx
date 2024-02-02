import "mapbox-gl/dist/mapbox-gl.css";

import React from "react";
import { createRoot } from "react-dom/client";
import { css, Global } from "@emotion/react";

import { App } from "./app/App";

const globalCss = css`
  html,
  body {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  #content {
    height: 100%;
  }

  ::selection {
    background: #f44336;
  }

  .mapboxgl-popup-content {
    margin-left: -16px;
    border-radius: 4px !important;
    background: #212121 !important;
    color: #ffffff;
    font-family: "Inter", sans-serif !important;
    padding: 8px !important;
    font-size: 16px;
    margin-top: 12px;
  }

  .mapboxgl-popup-tip {
    display: none;
  }
`;

const container = document.getElementById("content");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Global styles={globalCss}/>
    <App />
  </React.StrictMode>
);
