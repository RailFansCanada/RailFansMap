import React, { useContext } from "react";
import type { MapData } from "../config";
import { Source, Layer } from "react-map-gl";
import { AnyLayout } from "mapbox-gl";
import { LabelProviderContext } from "./Map";
import { FeatureCollection } from "geojson";

type NewLineProps = {
  data: FeatureCollection;
  showLineLabels?: boolean;
};

export const Lines = React.memo(({ data, showLineLabels }: NewLineProps) => {
  const { labelStyle } = useContext(LabelProviderContext);

  return (
    <Source id={"raildata"} type="geojson" data={data}>
      {/* Rail Yard layers */}
      <Layer
        id={`yard-tracks`}
        type="line"
        filter={[
          "all",
          ["==", ["get", "type"], "tracks"],
          ["==", ["get", "class"], "rail-yard"],
        ]}
        layout={{
          "line-join": "round",
          "line-cap": "round",
        }}
        paint={{
          "line-color": "#818181",
          "line-width": 3,
          "line-offset": ["*", ["get", "offset"], 3],
        }}
      />
      <Layer
        id={`rail-tunnel`}
        type="fill"
        filter={["all", ["==", ["get", "type"], "tunnel"]]}
        minzoom={14}
        paint={{
          "fill-color": "#212121",
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 15, 0.3],
        }}
      />
      <Layer
        id={`rail-alignment`}
        type="line"
        filter={["==", ["get", "type"], "alignment"]}
        layout={{
          "line-join": "round",
          "line-cap": "round",
        }}
        paint={{
          "line-color": ["get", "color"],
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 14, 1, 20, 0.3],
          "line-width": [
            "interpolate",
            ["exponential", 2],
            ["zoom"],
            14,
            3,
            20,
            150,
          ],
          "line-offset": [
            "interpolate",
            ["exponential", 2],
            ["zoom"],
            14,
            ["*", ["get", "offset"], 3],
            20,
            ["*", ["get", "offset"], 150],
          ],
        }}
      />
      <Layer
        id={`rail-tracks`}
        type="line"
        filter={[
          "all",
          ["==", ["get", "type"], "tracks"],
          ["==", ["get", "class"], "rail-line"],
        ]}
        layout={{
          "line-join": "round",
          "line-cap": "round",
        }}
        paint={{
          "line-color": ["get", "color"],
          "line-width": 3,
          "line-offset": ["*", ["get", "offset"], 3],
        }}
      />
      <Layer
        id={`rail-tracks-future`}
        type="line"
        filter={["==", ["get", "type"], "tracks-future"]}
        layout={{
          "line-join": "round",
          "line-cap": "round",
        }}
        paint={{
          "line-color": ["get", "color"],
          "line-width": 3,
          "line-dasharray": [3, 3],
        }}
      />
      <Layer
        id={`rail-overpass`}
        type="line"
        filter={["==", ["get", "type"], "overpass"]}
        minzoom={14}
        layout={{
          "line-join": "round",
          "line-cap": "butt",
        }}
        paint={{
          "line-color": ["get", "color"],
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
          "line-offset": ["*", ["get", "offset"], 3],
        }}
      />
      <Layer
        id={`rail-platforms`}
        type="fill"
        filter={["==", ["get", "type"], "station-platforms"]}
        paint={{
          "fill-color": ["get", "color"],
          "fill-opacity": 0.68,
        }}
      />
      <Layer
        id={`rail-platforms-future`}
        type="line"
        filter={["==", ["get", "type"], "station-platforms-future"]}
        paint={{
          "line-color": ["get", "color"],
          "line-dasharray": [3, 3],
          "line-width": 1.5,
        }}
      />
      <Layer
        id={`rail-station`}
        type="circle"
        filter={["==", ["get", "type"], "station-label"]}
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
      {showLineLabels && (
        <Layer
          id={`rail-labels`}
          type="symbol"
          filter={["==", ["get", "type"], "station-label"]}
          minzoom={13}
          layout={
            {
              "text-field": labelStyle,
              "text-anchor": "left",
              "text-offset": [0.75, 0],
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
        />
      )}
      {showLineLabels && (
        <Layer
          id={`rail-labels-major`}
          type="symbol"
          filter={[
            "all",
            ["==", ["get", "type"], "station-label"],
            ["==", ["get", "major"], true],
          ]}
          maxzoom={13}
          minzoom={9}
          layout={
            {
              "text-field": labelStyle,
              "text-anchor": "left",
              "text-offset": [0.75, 0],
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
        />
      )}
      {showLineLabels && (
        <Layer
          id={`yard-labels`}
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
        />
      )}
    </Source>
  );
});
