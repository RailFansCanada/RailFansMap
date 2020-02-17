import * as React from "react";
import * as GeoJSON from "geojson";
import { Source, Layer } from "react-map-gl";
import { Layer as MapboxLayer, AnyLayout } from "mapbox-gl";

export interface LineProps {
  data: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
  name: string;
}

export type LineFeatureType =
  | "tracks"
  | "station-platforms"
  | "station-label"
  | "overpass"
  | "tunnel";

export interface LineDataProps {
  name: string;
  color: string;
  type: LineFeatureType;
  url?: string;
}

export class Line extends React.Component<LineProps> {
  render() {
    let { name } = this.props;
    return (
      <Source id={name} type="geojson" data={this.props.data}>
        <Layer
          id={`${name}-tunnel`}
          type="fill"
          filter={["==", "type", "tunnel"]}
          minzoom={14}
          paint={{
            "fill-color": ["get", "color"],
            "fill-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              14,
              0,
              15,
              0.5
            ]
          }}
        />
        <Layer
          id={`${name}-tracks`}
          type="line"
          filter={["==", "type", "tracks"]}
          layout={{
            "line-join": "round",
            "line-cap": "round"
          }}
          paint={{
            "line-color": ["get", "color"],
            "line-width": 3
          }}
        />
        <Layer
          id={`${name}-overpass`}
          type="line"
          filter={["==", "type", "overpass"]}
          minzoom={14}
          layout={{
            "line-join": "round",
            "line-cap": "square"
          }}
          paint={{
            "line-color": ["get", "color"],
            "line-width": 1.5,
            "line-gap-width": [
              "interpolate",
              ["exponential", 2],
              ["zoom"],
              14,
              0,
              15,
              5
            ]
          }}
        />
        <Layer
          id={`${name}-platforms`}
          type="fill"
          filter={["==", "type", "station-platforms"]}
          paint={{
            "fill-color": ["get", "color"],
            "fill-opacity": 0.68
          }}
        />
        <Layer
          id={`${name}-labels`}
          type="symbol"
          filter={["==", "type", "station-label"]}
          minzoom={10}
          layout={
            {
              "icon-image": "station",
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
                1
              ],
              "text-transform": "uppercase",
              "text-font": ["Raleway Bold"],
              "text-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                10,
                14,
                15,
                16,
                18,
                24
              ]
            } as AnyLayout
          }
          paint={{
            "text-halo-width": 30,
            "text-halo-blur": 10,
            "text-color": "#FFFFFF",
            "text-halo-color": ["get", "color"]
          }}
        />
      </Source>
    );
  }
}
