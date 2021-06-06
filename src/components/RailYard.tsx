import React from "react";
import GeoJSON from "geojson";
import { Source, Layer } from "react-map-gl";
import { AnyLayout } from "mapbox-gl";
import { LINE_OFFSET } from "./Map";

export interface RailYardProps {
  name: string;
  data: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
  offset: number;
  showLabels: boolean;
}

export const RailYard = ({ name, data, offset, showLabels }: RailYardProps) => {
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
          "line-offset": offset * LINE_OFFSET,
        }}
      />
      { showLabels && (<Layer
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
            "text-size": 16,
            "icon-image": "label-background",
            "icon-text-fit": "both",
            "icon-text-fit-padding": [1, 4, 0, 4],
          } as AnyLayout
        }
        paint={{
          "text-color": "#FFFFFF",
        }}
      />)}
    </Source>
  );
};
