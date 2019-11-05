import * as React from "react";
import { GeoJSON } from "geojson";
import { Source, Layer } from "react-map-gl";
import { Layer as MapboxLayer } from "mapbox-gl";

// Simple type definitions for missing react-map-gl types
declare module "react-map-gl" {
  interface SourceProps {
    id?: string;
    type:
      | "vector"
      | "raster"
      | "raster-dem"
      | "geojson"
      | "image"
      | "video"
      | "canvas";
    children?: any;
  }

  class Source<Props extends SourceProps> extends React.PureComponent<Props> {}

  interface LayerProps {
    id?: string;
    type: string;
    source?: string;
    beforeId?: string;
    layout?: any;
    paint: any;
    filter?: any[];
    minzoom?: number;
    maxzoom?: number;
  }

  class Layer<Props extends MapboxLayer> extends React.PureComponent<Props> {}
}

export interface LineProps {
  data: GeoJSON;
  name: string;
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
            "fill-opacity": 0.6
          }}
        />
        <Layer
          id={`${name}-labels`}
          type="symbol"
          filter={["==", "type", "station-label"]}
          minzoom={10}
          layout={{
            "icon-image": "images/station.png",
            "text-field": "{name}",
            "text-anchor": "left",
            "text-offset": [0.75, 0],
            "text-optional": true,
            "icon-optional": false,
            "icon-allow-overlap": true,
            "text-size": 14,
            "icon-size": ["interpolate", ["linear"], ["zoom"], 10, 0.5, 13.5, 1]
          }}
          paint={{
            "text-halo-width": 1,
            "text-color": "#212121",
            "text-halo-color": "#FFFFFF"
          }}
        />
      </Source>
    );
  }
}
