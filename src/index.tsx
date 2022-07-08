import "mapbox-gl/dist/mapbox-gl.css";

import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { createGlobalStyle } from "styled-components";

import { App } from "./app/App";

const GlobalStyle = createGlobalStyle`
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
`;

const container = document.getElementById("content");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>
);
