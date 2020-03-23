import "mapbox-gl/dist/mapbox-gl.css";
import "./index.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { OverviewMap } from "./components/Map";
import { ViewState } from "react-map-gl";

const initialViewState = (): ViewState | null => {
  const hashParts = location.hash.substr(1).split("/");
  let builder: ViewState = null;

  const zoom = parseFloat(hashParts[0]);
  const latitude = parseFloat(hashParts[1]);
  const longitude = parseFloat(hashParts[2]);
  if (!isNaN(zoom) && !isNaN(latitude) && !isNaN(longitude)) {
    builder = { zoom, latitude, longitude };
  } else {
    return null;
  }

  const bearing = parseFloat(hashParts[3]);
  if (!isNaN(bearing)) {
    builder = { ...builder, bearing };
  }

  const pitch = parseFloat(hashParts[4]);
  if (!isNaN(pitch)) {
    builder = { ...builder, pitch };
  }
  return builder;
};

const viewState = initialViewState();

ReactDOM.render(
  <OverviewMap initialViewState={viewState} />,
  document.getElementById("content")
);
