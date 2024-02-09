import React, { useContext, useState, useEffect } from "react";
import { Source, Layer } from "react-map-gl";
import { AnyLayout, VectorSource, GeoJSONSourceRaw } from "mapbox-gl";
import { LabelProviderContext } from "./Map";
import { useIsDarkTheme } from "../app/utils";
import { useAppState } from "../hooks/useAppState";

type NewLineProps = {
  showLineLabels?: boolean;
  filterList: string[];
};

const root = () => {
  const url = `${location.protocol}//${location.host}${location.pathname}`;
  if (url.endsWith("/")) {
    return url.slice(0, url.length - 1);
  } else {
    return url;
  }
};

// Conditionally add source-layer property
const LAYER_PROPS = USE_TILES ? { "source-layer": "rail-map" } : {};

export const Lines = React.memo(
  ({ showLineLabels, filterList }: NewLineProps) => {
    const { labelStyle } = useContext(LabelProviderContext);
    const { appTheme } = useAppState();
    const isDarkTheme = useIsDarkTheme(appTheme);

    const [source, setSource] = useState<VectorSource | GeoJSONSourceRaw>(null);

    useEffect(() => {
      if (!USE_TILES) {
        setSource({
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        fetch("assembled.json")
          .then((result) => result.json())
          .then((data) => setSource({ type: "geojson", data }));
      } else {
        setSource({
          type: "vector",
          tiles: [`${root()}/tiles/{z}/{x}/{y}.pbf`],
        });
      }
    }, []);

    return (
      <Source id={"raildata"} {...source}>
        {/* Rail Yard layers */}
        <Layer
          id={`yard-tracks`}
          {...LAYER_PROPS}
          type="line"
          filter={[
            "all",
            ["==", ["get", "type"], "tracks"],
            [
              "in",
              ["get", "class"],
              ["literal", ["rail-yard", "streetcar-yard"]],
            ],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          layout={{
            "line-join": "round",
            "line-cap": "round",
            "line-sort-key": ["get", "layer"],
          }}
          paint={{
            "line-color": "#818181",
            "line-width": [
              "case",
              ["==", ["get", "class"], "streetcar-yard"],
              2,
              3,
            ],
            "line-offset": [
              "*",
              ["get", "offset"],
              ["case", ["==", ["get", "class"], "streetcar-yard"], 2, 3],
            ],
          }}
        />
        <Layer
          id={`rail-tunnel`}
          {...LAYER_PROPS}
          type="fill"
          filter={[
            "all",
            ["==", ["get", "type"], "tunnel"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          minzoom={14}
          layout={{
            "fill-sort-key": ["get", "layer"],
          }}
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
          id={`rail-platforms`}
          {...LAYER_PROPS}
          type="fill"
          filter={[
            "all",
            ["==", ["get", "type"], "station-platforms"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          layout={{
            "fill-sort-key": ["get", "layer"],
          }}
          paint={{
            "fill-color": ["get", "color"],
            "fill-opacity": 0.68,
          }}
        />
        <Layer
          id={`rail-platforms-future`}
          {...LAYER_PROPS}
          type="line"
          filter={[
            "all",
            ["==", ["get", "type"], "station-platforms-future"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          layout={{
            "line-sort-key": ["get", "layer"],
          }}
          paint={{
            "line-color": ["get", "color"],
            "line-dasharray": [3, 3],
            "line-width": 1.5,
          }}
        />
        <Layer
          id={`rail-alignment`}
          {...LAYER_PROPS}
          type="line"
          filter={[
            "all",
            ["==", ["get", "type"], "alignment"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          layout={{
            "line-join": "round",
            "line-cap": "round",
            "line-sort-key": ["get", "layer"],
          }}
          paint={{
            "line-color": ["get", "color"],
            "line-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              14,
              1,
              20,
              0.3,
            ],
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
          id={`tram`}
          {...LAYER_PROPS}
          type="line"
          filter={[
            "all",
            ["==", ["get", "type"], "tram"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          layout={{
            "line-join": "round",
            "line-cap": "round",
            "line-sort-key": ["get", "layer"],
          }}
          paint={{
            "line-color": ["get", "color"],
            "line-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              14,
              1,
              20,
              0.5,
            ],
            "line-width": [
              "interpolate",
              ["exponential", 2],
              ["zoom"],
              14,
              6,
              20,
              300,
            ],
            "line-offset": [
              "interpolate",
              ["exponential", 2],
              ["zoom"],
              14,
              ["*", ["get", "offset"], 6],
              20,
              ["*", ["get", "offset"], 300],
            ],
          }}
        />
                <Layer
          id={`tramstrike`}
          {...LAYER_PROPS}
          type="line"
          filter={[
            "all",
            ["==", ["get", "type"], "tramstrike"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          layout={{
            "line-join": "round",
            "line-cap": "round",
            "line-sort-key": ["get", "layer"],
          }}
          paint={{
            "line-color": "#FFFFFF",
            "line-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              14,
              1,
              20,
              0.3,
            ],
            "line-width": [
              "interpolate",
              ["exponential", 2],
              ["zoom"],
              14,
              1,
              20,
              50,
            ],
            "line-offset": [
              "interpolate",
              ["exponential", 2],
              ["zoom"],
              14,
              ["*", ["get", "offset"], 1],
              20,
              ["*", ["get", "offset"], 50],
            ],
          }}
        />
                        <Layer
          id={`brtpunch`}
          {...LAYER_PROPS}
          type="line"
          filter={[
            "all",
            ["==", ["get", "type"], "brtpunch"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          layout={{
            "line-join": "round",
            "line-cap": "round",
            "line-sort-key": ["get", "layer"],
          }}
          paint={{
            "line-color": "#000000",
            "line-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              14,
              1,
              20,
              0.3,
            ],
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
              ["*", ["get", "offset"], 1],
              20,
              ["*", ["get", "offset"], 50],
            ],
            "line-dasharray": [2, 4]
          }}
        />
        <Layer
          id={`rail-tracks`}
          {...LAYER_PROPS}
          type="line"
          filter={[
            "all",
            ["==", ["get", "type"], "tracks"],
            ["==", ["get", "class"], "rail-line"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          layout={{
            "line-join": "round",
            "line-cap": "round",
            "line-sort-key": ["get", "layer"],
          }}
          paint={{
            "line-color": ["get", "color"],
            "line-width": 3,
            "line-offset": ["*", ["get", "offset"], 3],
          }}
        />
        <Layer
          id={`streetcar-tracks`}
          {...LAYER_PROPS}
          type="line"
          filter={[
            "all",
            ["==", ["get", "type"], "tracks"],
            ["==", ["get", "class"], "streetcar-line"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          layout={{
            "line-join": "round",
            "line-cap": "round",
            "line-sort-key": ["get", "layer"],
          }}
          paint={{
            "line-color": ["get", "color"],
            "line-width": 1.5,
            "line-offset": ["*", ["get", "offset"], 1.5],
          }}
        />
        <Layer
          id={`rail-tracks-future`}
          {...LAYER_PROPS}
          type="line"
          filter={[
            "all",
            ["==", ["get", "type"], "tracks-future"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          layout={{
            "line-join": "round",
            "line-cap": "round",
            "line-sort-key": ["get", "layer"],
          }}
          paint={{
            "line-color": ["get", "color"],
            "line-width": 3,
            "line-dasharray": [3, 3],
          }}
        />
        <Layer
          id={`rail-overpass`}
          {...LAYER_PROPS}
          type="line"
          filter={[
            "all",
            ["==", ["get", "type"], "overpass"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          minzoom={14}
          layout={{
            "line-join": "round",
            "line-cap": "butt",
            "line-sort-key": ["get", "layer"],
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
          id="rail-connector-labels-dash"
          {...LAYER_PROPS}
          type="line"
          filter={[
            "all",
            ["==", ["get", "type"], "station-connector-label"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          minzoom={15}
          layout={{
            "line-cap": "round",
          }}
          paint={{
            "line-width": 2,
            "line-color": isDarkTheme ? "#FFFFFF" : "#212121",
            "line-gap-width": 10,
            "line-dasharray": [4, 4],
          }}
        />
        <Layer
          id={`streetcar-rail-station`}
          {...LAYER_PROPS}
          type="circle"
          filter={[
            "all",
            ["==", ["get", "type"], "station-label"],
            ["==", ["get", "class"], "streetcar-line"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          minzoom={11}
          layout={{}}
          paint={{
            "circle-color": "#FFFFFF",
            "circle-stroke-color": ["get", "color"],
            "circle-stroke-width": 2,
            "circle-radius": [
              "interpolate",
              ["exponential", 2],
              ["zoom"],
              10,
              2,
              17,
              6,
            ],
            "circle-pitch-alignment": "map",
          }}
        />
        <Layer
          id={`rail-station`}
          {...LAYER_PROPS}
          type="circle"
          filter={[
            "all",
            ["==", ["get", "type"], "station-label"],
            ["==", ["get", "class"], "rail-line"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
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
            "circle-pitch-alignment": "map",
          }}
        />
        <Layer
          id="rail-connector-labels-bg"
          {...LAYER_PROPS}
          type="line"
          filter={[
            "all",
            ["==", ["get", "type"], "station-connector-label"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          maxzoom={16}
          layout={{
            "line-cap": "round",
          }}
          paint={{
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              8,
              13.5,
              16,
            ],
            "line-color": "#212121",
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 15, 1, 16, 0],
          }}
        />
        <Layer
          id="rail-connector-labels"
          {...LAYER_PROPS}
          type="line"
          filter={[
            "all",
            ["==", ["get", "type"], "station-connector-label"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          maxzoom={16}
          layout={{
            "line-cap": "round",
          }}
          paint={{
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              4,
              13.5,
              12,
            ],
            "line-color": "#FFFFFF",
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 15, 1, 16, 0],
          }}
        />
        {showLineLabels && (
          <Layer
            id={`yard-labels`}
            {...LAYER_PROPS}
            type="symbol"
            filter={[
              "all",
              ["==", ["get", "type"], "yard-label"],
              ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
            ]}
            minzoom={14}
            layout={
              {
                "text-field": ["get", "name"],
                "text-anchor": "center",
                "text-optional": true,
                "text-font": ["Inter Bold"],
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
            id={`rail-labels`}
            {...LAYER_PROPS}
            type="symbol"
            filter={[
              "all",
              ["==", ["get", "class"], "rail-line"],
              ["==", ["get", "type"], "station-label"],
              ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
              [">=", ["zoom"], ["match", ["get", "scale"], "large", 7, 13]],
            ]}
            // minzoom={13}
            layout={
              {
                "text-field": labelStyle,
                "text-anchor": "left",
                "text-offset": [0.75, 0],
                "text-font": ["Inter Bold"],
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
            id={`streetcar-labels`}
            {...LAYER_PROPS}
            type="symbol"
            filter={[
              "all",
              ["==", ["get", "class"], "streetcar-line"],
              ["==", ["get", "type"], "station-label"],
              ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
            ]}
            minzoom={15}
            layout={
              {
                "text-field": labelStyle,
                "text-anchor": "left",
                "text-offset": [0.75, 0],
                "text-font": ["Inter Bold"],
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
            {...LAYER_PROPS}
            type="symbol"
            filter={[
              "all",
              ["==", ["get", "type"], "station-label"],
              ["==", ["get", "major"], true],
              ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
              ["<", ["zoom"], ["match", ["get", "scale"], "large", 7, 13]],
              [">=", ["zoom"], ["match", ["get", "scale"], "large", 4, 9]],
            ]}
            // maxzoom={13}
            // minzoom={9}
            layout={
              {
                "text-field": labelStyle,
                "text-anchor": "left",
                "text-offset": [0.75, 0],
                "text-font": ["Inter Bold"],
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
  }
);
