import React, { useContext } from "react";
import { Source, Layer } from "@urbica/react-map-gl";
import { AnyLayout } from "mapbox-gl";
import { LabelProviderContext } from "./Map";
import { FeatureCollection } from "geojson";
import { useIsDarkTheme } from "../app/utils";
import { useAppState } from "../hooks/useAppState";

type NewLineProps = {
  data: FeatureCollection;
  showLineLabels?: boolean;
  filterList: string[];
};

export const Lines = React.memo(
  ({ data, showLineLabels, filterList }: NewLineProps) => {
    const { labelStyle } = useContext(LabelProviderContext);
    const { appTheme } = useAppState();
    const isDarkTheme = useIsDarkTheme(appTheme);

    return (
      <>
        <Source id={"raildata"} type="geojson" data={data} />
        {/* Rail Yard layers */}
        <Layer
          id={`yard-tracks`}
          source="raildata"
          type="line"
          filter={[
            "all",
            ["==", ["get", "type"], "tracks"],
            ["==", ["get", "class"], "rail-yard"],
            ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
          ]}
          layout={{
            "line-join": "round",
            "line-cap": "round",
            "line-sort-key": ["get", "layer"],
          }}
          paint={{
            "line-color": "#818181",
            "line-width": 3,
            "line-offset": ["*", ["get", "offset"], 3],
          }}
        />
        <Layer
          id={`rail-tunnel`}
          source="raildata"
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
          id={`rail-alignment`}
          source="raildata"
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
          id={`rail-tracks`}
          source="raildata"
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
          id={`rail-tracks-future`}
          source="raildata"
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
          source="raildata"
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
          id={`rail-platforms`}
          source="raildata"
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
          source="raildata"
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
          id="rail-connector-labels-dash"
          source="raildata"
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
          id={`rail-station`}
          source="raildata"
          type="circle"
          filter={[
            "all",
            ["==", ["get", "type"], "station-label"],
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
          source="raildata"
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
          source="raildata"
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
            source="raildata"
            type="symbol"
            filter={[
              "all",
              ["==", ["get", "type"], "yard-label"],
              ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
            ]}
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
        {showLineLabels && (
          <Layer
            id={`rail-labels`}
            source="raildata"
            type="symbol"
            filter={[
              "all",
              ["==", ["get", "type"], "station-label"],
              ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
            ]}
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
            source="raildata"
            type="symbol"
            filter={[
              "all",
              ["==", ["get", "type"], "station-label"],
              ["==", ["get", "major"], true],
              ["!", ["in", ["get", "filterKey"], ["literal", filterList]]],
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
      </>
    );
  }
);
