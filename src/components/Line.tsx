import * as React from "react";
import * as GeoJSON from "geojson";
import { Source, Layer } from "react-mapbox-gl";
import { AnyLayout } from "mapbox-gl";

export interface LineProps {
  data: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
  name: string;
  color: string;
}

export type LineFeatureType =
  | "tracks"
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

export const Line = ({ name, data, color }: LineProps) => {
  const dataRef = React.useRef({ type: "geojson", data });
  return (
    <>
      <Source id={name} type="geojson" geoJsonSource={dataRef.current} />
      <Layer
        id={`${name}-tunnel`}
        sourceId={name}
        before="content-mask"
        type="fill"
        filter={["==", "type", "tunnel"]}
        minzoom={14}
        paint={{
          "fill-color": color,
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 15, 0.5],
        }}
      />
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
          "line-color": color,
          "line-width": 3,
        }}
      />
      <Layer
        id={`${name}-overpass`}
        beforeId="content-mask"
        type="line"
        sourceId={name}
        filter={["==", "type", "overpass"]}
        minzoom={14}
        layout={{
          "line-join": "round",
          "line-cap": "square",
        }}
        paint={{
          "line-color": color,
          "line-width": 1.5,
          "line-gap-width": [
            "interpolate",
            ["exponential", 2],
            ["zoom"],
            14,
            0,
            15,
            5,
          ],
        }}
      />
      <Layer
        id={`${name}-platforms`}
        beforeId="content-mask"
        type="fill"
        sourceId={name}
        filter={["==", "type", "station-platforms"]}
        paint={{
          "fill-color": color,
          "fill-opacity": 0.68,
        }}
      />
      <Layer
        id={`${name}-platforms-future`}
        beforeId="content-mask"
        type="line"
        sourceId={name}
        filter={["==", "type", "station-platforms-future"]}
        paint={{
          "line-color": color,
          "line-dasharray": [3, 3],
          "line-width": 1.5
        }}
      />
      <Layer
        id={`${name}-station`}
        beforeId="circle-mask"
        type="circle"
        sourceId={name}
        filter={["==", "type", "station-label"]}
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
        sourceId={name}
        filter={["==", "type", "station-label"]}
        minZoom={11}
        layout={
          {
            "text-field": "{name}",
            "text-anchor": "left",
            "text-offset": [0.75, 0],
            "text-optional": true,
            "icon-optional": false,
            "icon-allow-overlap": true,
            "icon-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              0.5,
              13.5,
              1,
            ],
            // "text-transform": "uppercase",
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
          } as AnyLayout
        }
        paint={{
          "text-halo-width": 2,
          "text-halo-blur": 0,
          // "text-color": "#FFFFFF",
          // "text-halo-color": ["get", "color"]
          "text-color": color,
          "text-halo-color": "#FFFFFF",
        }}
      />
      <Layer
        id={`${name}-labels-major`}
        beforeId="symbol-mask"
        type="symbol"
        sourceId={name}
        filter={["all", ["==", "type", "station-label"], ["==", "major", true]]}
        maxZoom={11}
        minZoom={9}
        layout={
          {
            "text-field": "{name}",
            "text-anchor": "left",
            "text-offset": [0.75, 0],
            "text-optional": true,
            "icon-optional": false,
            "icon-allow-overlap": true,
            "icon-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              0.5,
              13.5,
              1,
            ],
            // "text-transform": "uppercase",
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
          } as AnyLayout
        }
        paint={{
          "text-halo-width": 2,
          "text-halo-blur": 0,
          // "text-color": "#FFFFFF",
          // "text-halo-color": ["get", "color"]
          "text-color": color,
          "text-halo-color": "#FFFFFF",
        }}
      />
    </>
  );
};
