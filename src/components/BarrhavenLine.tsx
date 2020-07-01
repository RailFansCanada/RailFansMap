import React from "react";
import { LineProps } from "./Line";

import { Alternatives, State } from "../redux";
import { connect } from "react-redux";
import { AnyLayout } from "mapbox-gl";
import { Layer, Source } from "react-mapbox-gl";

export interface BarrhavenLineProps {
  readonly color: string;

  readonly activeAlternatives: Alternatives[];
}

const BarrhavenLineComponent = React.memo(
  ({
    name,
    data,
    color,
    highContrastLabels,
    ...props
  }: LineProps & BarrhavenLineProps) => {
    const dataRef = React.useRef({ type: "geojson", data });

    const alternativesFilter = [
      "any",
      ...props.activeAlternatives.map((value) => {
        return ["!=", ["index-of", value, ["get", "alternatives"]], -1];
      }),
    ];

    return (
      <>
        <Source id={name} type="geojson" geoJsonSource={dataRef.current} />
        <Layer
          id={`${name}-tunnel`}
          sourceId={name}
          before="content-mask"
          type="fill"
          filter={[
            "all",
            ["any", ["==", ["get", "alternatives"], null], alternativesFilter],
            ["==", ["get", "type"], "tunnel"],
          ]}
          minzoom={14}
          paint={{
            "fill-color": color,
            "fill-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              14,
              0,
              15,
              0.5,
            ],
          }}
        />
        <Layer
          id={`${name}-tracks`}
          before="content-mask"
          type="line"
          sourceId={name}
          filter={[
            "all",
            ["any", ["==", ["get", "alternatives"], null], alternativesFilter],
            ["==", ["get", "type"], "tracks"],
          ]}
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
          before="content-mask"
          type="line"
          sourceId={name}
          filter={[
            "all",
            ["any", ["==", ["get", "alternatives"], null], alternativesFilter],
            ["==", ["get", "type"], "overpass"],
          ]}
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
          before="content-mask"
          type="fill"
          sourceId={name}
          filter={[
            "all",
            ["any", ["==", ["get", "alternatives"], null], alternativesFilter],
            ["==", ["get", "type"], "station-platforms"],
          ]}
          paint={{
            "fill-color": color,
            "fill-opacity": 0.68,
          }}
        />
        <Layer
          id={`${name}-platforms-future`}
          before="content-mask"
          type="line"
          sourceId={name}
          filter={[
            "all",
            ["any", ["==", ["get", "alternatives"], null], alternativesFilter],
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
          before="circle-mask"
          type="circle"
          sourceId={name}
          filter={[
            "all",
            ["any", ["==", ["get", "alternatives"], null], alternativesFilter],
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
          before="symbol-mask"
          type="symbol"
          sourceId={name}
          filter={[
            "all",
            ["any", ["==", ["get", "alternatives"], null], alternativesFilter],
            ["==", ["get", "type"], "station-label"],
          ]}
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
              "text-transform": "uppercase",
            } as AnyLayout
          }
          paint={{
            "text-halo-width": 50,
            "text-halo-blur": 50,
            "text-color": "#FFFFFF",
            "text-halo-color": highContrastLabels ? "#212121" : color,
            //"text-color": color,
            //"text-halo-color": "#FFFFFF",
          }}
        />
        <Layer
          id={`${name}-labels-major`}
          before="symbol-mask"
          type="symbol"
          sourceId={name}
          filter={[
            "all",
            ["==", ["get", "type"], "station-label"],
            ["==", ["get", "major"], true],
            ["any", ["==", ["get", "alternatives"], null], alternativesFilter],
          ]}
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
              "text-transform": "uppercase",
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
            "text-halo-width": 50,
            "text-halo-blur": 50,
            "text-color": "#FFFFFF",
            "text-halo-color": highContrastLabels ? "#212121" : color,
          }}
        />
      </>
    );
  }
);

const mapStateToProps = (state: State) => ({
  activeAlternatives: state.barrhavenAlternatives,
});

export const BarrhavenLine = connect(mapStateToProps)(BarrhavenLineComponent);
