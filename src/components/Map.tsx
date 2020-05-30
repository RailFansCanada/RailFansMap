import * as React from "react";
// import ReactMapGL, {
//   ViewState,
//   LinearInterpolator,
//   NavigationControl,
//   Layer,
//   Source,
//   FlyToInterpolator,
// } from "react-map-gl";

import ReactMapboxGl, {
  Source,
  Layer,
  ZoomControl,
  RotationControl,
} from "react-mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { Line } from "./Line";
import * as stage1 from "../../data/stage1.json";
import * as stage2south from "../../data/stage2south.json";
import * as stage2east from "../../data/stage2east.json";
import * as stage2west from "../../data/stage2west.json";
import * as stage3kanata from "../../data/stage3kanata.json";
import * as stage3barrhaven from "../../data/stage3barrhaven.json";
import * as GeoJSON from "geojson";

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1IjoiZGVsbGlzZCIsImEiOiJjazBqaXVveXEwN3k3M25tcjRzZHJkZmUzIn0.m0p9C09Vm2V-YVtQEgSQtg",
  customAttribution: ["Data: City of Ottawa"],
  hash: true,
  antialias: true,
});

export const OverviewMap = () => {
  return (
    <Map
      style="mapbox://styles/mapbox/light-v10"
      containerStyle={{
        height: "100vh",
        width: "100vw",
      }}
    >
      <ZoomControl />
      <RotationControl />
      {/* Layer z-ordering hack */}
      <Source
        id="blank"
        type="geojson"
        geoJsonSource={{
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        }}
      ></Source>
      <Layer
        sourceId="blank"
        type="fill"
        id="content-mask"
        paint={{}}
        layout={{}}
      />
      <Layer
        sourceId="blank"
        type="fill"
        id="circle-mask"
        paint={{}}
        layout={{}}
      />
      <Layer
        sourceId="blank"
        type="fill"
        id="symbol-mask"
        paint={{}}
        layout={{}}
      />
      <Line
        data={stage3barrhaven as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
        name="stage3barrhaven"
        color="#C8963E"
      />
      <Line
        data={stage2south as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
        name="stage2south"
        color="#76BE43"
      />
      <Line
        data={stage2east as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
        name="stage2east"
        color="#D62937"
      />
      <Line
        data={stage2west as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
        name="stage2west"
        color="#D62937"
      />
      <Line
        data={stage1 as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
        name="stage1"
        color="#D62937"
      />
      <Line
        data={stage3kanata as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
        name="stage3kanata"
        color="#5202F1"
      />
    </Map>
  );
};
