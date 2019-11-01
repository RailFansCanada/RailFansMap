import "mapbox-gl/dist/mapbox-gl.css";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { Map } from "./components/Map";
import mapboxgl from "mapbox-gl";

ReactDOM.render(
    <Map width="400" height="400" mapboxApiAccessToken="pk.eyJ1IjoiZGVsbGlzZCIsImEiOiJjazBqaXVveXEwN3k3M25tcjRzZHJkZmUzIn0.m0p9C09Vm2V-YVtQEgSQtg" />,
    document.getElementById("content")
)