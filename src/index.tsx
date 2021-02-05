import "mapbox-gl/dist/mapbox-gl.css";

import React from "react";
import ReactDOM from "react-dom";
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

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>,
  document.getElementById("content")
);
