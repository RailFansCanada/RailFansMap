import React, { useCallback, useState } from "react";

import ReactMapGL, {
  Source,
  Layer,
  MapEvent,
  ViewportProps,
} from "react-map-gl";
import styled from "styled-components";

import "mapbox-gl/dist/mapbox-gl.css";
import { Line } from "./Line";
import { RailYard } from "./RailYard";

import {
  State,
  AppTheme,
  MapStyle,
  LineState,
  setTargetZoom,
  setZoom,
} from "../redux";
import { connect } from "react-redux";
import { useIsDarkTheme } from "../app/utils";
import { useData } from "../hooks/useData";
import { useHash } from "../hooks/useHash";

export interface OverviewMapProps {
  readonly show3DBuildings: boolean;
  readonly appTheme: AppTheme;
  readonly mapStyle: MapStyle;
  readonly lines: LineState;
  readonly accessibleLabels: boolean;

  readonly targetZoom: number;
  readonly setTargetZoom: typeof setTargetZoom;
  readonly setZoom: typeof setZoom;
}

const Map = styled(ReactMapGL)`
  width: 100vw;
  height: 100vw;
`;

export const OverviewMapComponent = React.memo((props: OverviewMapProps) => {
  const hash = useHash();
  const [viewport, setViewport] = useState<ViewportProps>({
    longitude: -75.6579,
    latitude: 45.3629,
    zoom: 11,
    bearing: -30,
    width: ("100%" as unknown) as number,
    height: ("100%" as unknown) as number,
    ...hash,
  });

  const data = useData();
  // Give station icons and all labels the pointer cursor
  const interactiveLayerIds = Object.keys(data)
    .filter(
      (key) =>
        data[key].metadata.filterKey == null ||
        props.lines[data[key].metadata.filterKey]
    )
    .flatMap((key) => {
      if (data[key].metadata.type === "rail-line") {
        return [`${key}-station`, `${key}-labels`];
      } else if (data[key].metadata.type === "rail-yard") {
        return [`${key}-labels`];
      }
    });

  const isDarkTheme = useIsDarkTheme(props.appTheme);

  const [style, setStyle] = React.useState(
    props.mapStyle === "satellite"
      ? "mapbox://styles/mapbox/satellite-streets-v11"
      : isDarkTheme
      ? "mapbox://styles/mapbox/dark-v10"
      : "mapbox://styles/mapbox/light-v10"
  );

  const handleClick = (event: MapEvent) => {
    event.features?.forEach((feature) => {
      if (feature.properties.url != null && feature.properties.url !== "null") {
        window.parent.location.href = `${BASE_URL}/${feature.properties.url}`;
      }
    });
  };

  React.useEffect(() => {
    if (props.mapStyle === "satellite") {
      setStyle("mapbox://styles/mapbox/satellite-streets-v11");
    } else {
      setStyle(
        isDarkTheme
          ? "mapbox://styles/mapbox/dark-v10"
          : "mapbox://styles/mapbox/light-v10"
      );
    }
  }, [isDarkTheme, props.appTheme, props.mapStyle]);

  React.useEffect(() => {
    // Zoom input from +/- buttons
    setViewport((viewport) => ({ ...viewport, zoom: props.targetZoom }));
  }, [props.targetZoom]);

  React.useEffect(() => {
    props.setZoom(viewport.zoom);
  }, [viewport]);

  return (
    <Map
      mapStyle={style}
      {...viewport}
      onViewportChange={setViewport}
      onClick={handleClick}
      interactiveLayerIds={interactiveLayerIds}
      mapboxApiAccessToken={MAPBOX_KEY}
      scrollZoom={({ speed: 1 } as unknown) as boolean}
      mapOptions={{
        customAttribution: ["Data: City of Ottawa"],
        hash: true,
        antiAlias: true,
      }}
    >
      {/* Layer z-ordering hack */}
      <Source
        id="blank"
        type="geojson"
        data={{
          type: "FeatureCollection",
          features: [],
        }}
      >
        <Layer type="fill" id="content-mask" paint={{}} layout={{}} />
        <Layer type="fill" id="circle-mask" paint={{}} layout={{}} />
        <Layer type="fill" id="symbol-mask" paint={{}} layout={{}} />
      </Source>

      <Layer
        id="sky"
        type="sky"
        paint={
          {
            "sky-atmosphere-sun": isDarkTheme ? [0, 95] : [0, 0],
          } as unknown
        }
      />

      {props.show3DBuildings && (
        <Layer
          id="3d-buildings"
          source="composite"
          {...{ "source-layer": "building" }}
          filter={["==", "extrude", "true"]}
          type="fill-extrusion"
          beforeId="content-mask"
          minzoom={15}
          paint={{
            "fill-extrusion-color": isDarkTheme ? "#212121" : "#FFFFFF",

            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.6,
          }}
        />
      )}
      {Object.entries(data).map(([key, data]) => {
        if (
          data.metadata?.type === "rail-line" &&
          (data.metadata.filterKey == null ||
            props.lines[data.metadata.filterKey])
        ) {
          return (
            <Line
              data={data}
              name={key}
              color={data.metadata.color ?? "#212121"}
              highContrastLabels={props.accessibleLabels}
            />
          );
        } else if (
          data.metadata?.type === "rail-yard" &&
          (data.metadata.filterKey == null ||
            props.lines[data.metadata.filterKey])
        ) {
          return <RailYard name={key} data={data} />;
        }
      })}
    </Map>
  );
});

const mapStateToProps = (state: State) => ({
  show3DBuildings: state.show3DBuildings,
  appTheme: state.appTheme,
  mapStyle: state.mapStyle,
  lines: state.lines,
  accessibleLabels: state.accessibleLabels,
  targetZoom: state.targetZoom,
});

const mapDispatchToProps = {
  setTargetZoom,
  setZoom,
};

export const OverviewMap = connect(
  mapStateToProps,
  mapDispatchToProps
)(OverviewMapComponent);
