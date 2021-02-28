import React from "react";
import GeoJSON from "geojson";
import { Source, Layer } from "react-map-gl";
import { AnyLayout } from "mapbox-gl";

export interface LineProps {
  data: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
  name: string;
  color: string;
  offset: number;
  highContrastLabels?: boolean;
}

export type LineFeatureType =
  | "tracks"
  | "tracks-future"
  | "station-platforms"
  | "station-platforms-future"
  | "station-label"
  | "overpass"
  | "tunnel";

export interface LineDataProps {
  name: string;
  color: string;
  type: LineFeatureType;
  url?: string;
}

const labelExpression = [
  "format",
  ["get", "name"],
  {},
  " ",
  {},
  ["case", 
    ["in", 1, ["get", "lines"]], ["image", "line1icon"],
    ""
  ],
  {},
  ["case", 
    ["in", 2, ["get", "lines"]], ["image", "line2icon"],
    ""
  ],
  {},
  ["case", 
    ["in", 3, ["get", "lines"]], ["image", "line3icon"],
    ""
  ],
  {},
  ["case", 
    ["in", 4, ["get", "lines"]], ["image", "line4icon"],
    ""
  ],
  {},
]

export const Line = React.memo(
  ({ name, data, color, offset, highContrastLabels }: LineProps) => {
    return (
      <Source id={name} type="geojson" data={data}>
        <Layer
          id={`${name}-tunnel`}
          beforeId="content-mask"
          type="fill"
          filter={[
            "all",
            ["==", ["get", "alternatives"], null],
            ["==", ["get", "type"], "tunnel"],
          ]}
          minzoom={14}
          paint={{
            "fill-color": "#212121",
            "fill-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              14,
              0,
              15,
              0.3,
            ],
          }}
        />
        <Layer
          id={`${name}-tracks`}
          beforeId="content-mask"
          type="line"
          filter={[
            "all",
            ["==", ["get", "alternatives"], null],
            ["==", ["get", "type"], "tracks"],
          ]}
          layout={{
            "line-join": "round",
            "line-cap": "round",
          }}
          paint={{
            "line-color": color,
            "line-width": 3,
            "line-offset": offset * 3
          }}
        />
        <Layer
          id={`${name}-tracks-future`}
          beforeId="content-mask"
          type="line"
          filter={[
            "all",
            ["==", ["get", "alternatives"], null],
            ["==", ["get", "type"], "tracks-future"],
          ]}
          layout={{
            "line-join": "round",
            "line-cap": "round",
          }}
          paint={{
            "line-color": color,
            "line-width": 3,
            "line-dasharray": [3, 3],
          }}
        />
        <Layer
          id={`${name}-overpass`}
          beforeId="content-mask"
          type="line"
          filter={[
            "all",
            ["==", ["get", "alternatives"], null],
            ["==", ["get", "type"], "overpass"],
          ]}
          minzoom={14}
          layout={{
            "line-join": "round",
            "line-cap": "butt",
          }}
          paint={{
            "line-color": color,
            "line-width": 1,
            "line-gap-width": [
              "interpolate",
              ["exponential", 2],
              ["zoom"],
              15,
              0,
              18,
              15,
            ],
            "line-offset": offset * 3
          }}
        />
        <Layer
          id={`${name}-platforms`}
          beforeId="content-mask"
          type="fill"
          filter={[
            "all",
            ["==", ["get", "alternatives"], null],
            ["==", ["get", "type"], "station-platforms"],
          ]}
          paint={{
            "fill-color": color,
            "fill-opacity": 0.68,
          }}
        />
        <Layer
          id={`${name}-platforms-future`}
          beforeId="content-mask"
          type="line"
          filter={[
            "all",
            ["==", ["get", "alternatives"], null],
            ["==", ["get", "type"], "station-platforms-future"],
          ]}
          paint={{
            "line-color": color,
            "line-dasharray": [3, 3],
            "line-width": 1.5,
          }}
        />
        <Layer
          id={`${name}-station`}
          beforeId="circle-mask"
          type="circle"
          filter={[
            "all",
            ["==", ["get", "alternatives"], null],
            ["==", ["get", "type"], "station-label"],
          ]}
          layout={{}}
          paint={{
            "circle-color": "#ffffff",
            "circle-stroke-color": "#212121",
            "circle-stroke-width": 2,
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              2,
              13.5,
              6,
            ],
          }}
        />
        <Layer
          id={`${name}-labels`}
          beforeId="symbol-mask"
          type="symbol"
          filter={[
            "all",
            ["==", ["get", "alternatives"], null],
            ["==", ["get", "type"], "station-label"],
          ]}
          minzoom={11}
          layout={
            {
              "text-field": /*"{name}"*/ labelExpression,
              "text-anchor": "left",
              "text-offset": [0.75, 0],
              "text-font": ["Raleway Bold"],
              "text-size": 16,
              "icon-image": "label-background",
              "icon-text-fit": "both",
              "icon-text-fit-padding": [1, 4, 0, 4]
            } as AnyLayout
          }
          paint={{
            "text-color": "#FFFFFF",
          }}
        />
        <Layer
          id={`${name}-labels-major`}
          beforeId="symbol-mask"
          type="symbol"
          filter={[
            "all",
            ["==", ["get", "type"], "station-label"],
            ["==", ["get", "major"], true],
            ["==", ["get", "alternatives"], null],
          ]}
          maxzoom={11}
          minzoom={9}
          layout={
            {
              "text-field": /*"{name}"*/ labelExpression,
              "text-anchor": "left",
              "text-offset": [0.75, 0],
              "text-font": ["Raleway Bold"],
              "text-size": 16,
              "icon-image": "label-background",
              "icon-text-fit": "both",
              "icon-text-fit-padding": [1, 4, 0, 4]
            } as AnyLayout
          }
          paint={{
            "text-color": "#FFFFFF",
          }}
        />
      </Source>
    );
  }
);
