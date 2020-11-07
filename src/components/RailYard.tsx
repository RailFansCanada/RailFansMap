import React from "react";
import GeoJSON from "geojson";
import { Source, Layer } from "react-mapbox-gl";
import { AnyLayout } from "mapbox-gl";

export interface RailYardProps {
  name: string;
  data: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
}

export const RailYard = ({ name, data }: RailYardProps) => {
  const dataRef = React.useRef({ type: "geojson", data });
  return (
    <>
      <Source id={name} type="geojson" geoJsonSource={dataRef.current} />
      <Layer
        id={`${name}-tracks`}
        before="content-mask"
        type="line"
        sourceId={name}
        filter={["==", "type", "tracks"]}
        layout={{
          "line-join": "round",
          "line-cap": "round",
        }}
        paint={{
          "line-color": "#818181",
          "line-width": 3,
        }}
      />
      <Layer
        id={`${name}-labels`}
        beforeId="symbol-mask"
        type="symbol"
        sourceId={name}
        filter={["==", "type", "yard-label"]}
        minZoom={11}
        layout={
          {
            "text-field": ["get", "name"],
            "text-anchor": "center",
            "text-optional": true,
            "text-font": ["Raleway Bold"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              12,
              15,
              18,
              18,
              26,
            ],
            "text-transform": "uppercase",
          } as AnyLayout
        }
        paint={{
          "text-halo-width": 30,
          "text-halo-blur": 30,
          "text-color": "#FFFFFF",
          "text-halo-color": "#212121",
        }}
      />
    </>
  );
};
