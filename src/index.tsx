import "mapbox-gl/dist/mapbox-gl.css";
import "./index.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { OverviewMap } from "./components/Map";

ReactDOM.render(<OverviewMap />, document.getElementById("content"));
