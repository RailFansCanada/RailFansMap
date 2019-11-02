import "mapbox-gl/dist/mapbox-gl.css";
import "./index.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { Map } from "./components/Map";
import mapboxgl from "mapbox-gl";

ReactDOM.render(<Map />, document.getElementById("content"));
