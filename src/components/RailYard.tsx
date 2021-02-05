import React from "react";
import GeoJSON from "geojson";
import { Source, Layer } from "react-map-gl";
import { AnyLayout } from "mapbox-gl";

export interface RailYardProps {
  name: string;
  data: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
}

export const RailYard = ({ name, data }: RailYardProps) => {
  return (
    <Source id={name} type="geojson" data={data}>
      <Layer
        id={`${name}-tracks`}
        beforeId="content-mask"
        type="line"
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
        filter={["==", "type", "yard-label"]}
        minzoom={11}
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
    </Source>
  );
};
