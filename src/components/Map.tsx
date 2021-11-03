import React, { useEffect, useRef, useState } from "react";

import ReactMapGL, {
  Source,
  Layer,
  MapEvent,
  ViewportProps,
  MapRef,
  AttributionControl,
} from "react-map-gl";
import { Map as MapboxMap } from "mapbox-gl";
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
  Alternatives,
} from "../redux";
import { connect } from "react-redux";
import { useIsDarkTheme } from "../app/utils";
import { Dataset } from "../hooks/useData";
import { useHash } from "../hooks/useHash";
import { MapIcon } from "./Icons";
import { useWindow } from "../hooks/useWindow";
import labelBackground from "../images/label.svg";
import { BBox } from "geojson";
import { MapboxOptions } from "mapbox-gl";

const provideLabelStyle = (mapData: Dataset, state: LineState) => [
  "format",
  ["get", "name"],
  {},
  " ",
  {},
  ...Object.values(mapData)
    .filter(
      (value) =>
        value.metadata.icon != null &&
        (value.metadata.filterKey == null || state[value.metadata.filterKey])
    )
    .map((value) => value.metadata.id)
    .sort()
    .flatMap((id) => [
      ["case", ["in", id, ["get", "lines"]], ["image", id], ""],
      {},
    ]),
];

interface LabelProvider {
  labelStyle: {}[];
}

export const LabelProviderContext = React.createContext<LabelProvider>({
  labelStyle: [],
});

export interface OverviewMapProps {
  readonly show3DBuildings: boolean;
  readonly appTheme: AppTheme;
  readonly mapStyle: MapStyle;
  readonly lines: LineState;
  readonly accessibleLabels: boolean;
  readonly alternatives: Alternatives;
  readonly showLineLabels: boolean;

  readonly targetZoom: number;
  readonly setTargetZoom: typeof setTargetZoom;
  readonly setZoom: typeof setZoom;

  readonly data: Dataset;
  updateBbox(bbox: BBox): void;
}

export const LINE_OFFSET = 3;

const Map = styled(ReactMapGL)`
  width: 100vw;
  height: 100vw;
`;

export const OverviewMapComponent = (props: OverviewMapProps) => {
  const windowSize = useWindow();
  const [viewport, setViewport] = useState<ViewportProps>({
    longitude: -75.6579,
    latitude: 45.3629,
    zoom: 11,
    bearing: -30,
    width: windowSize[0],
    height: windowSize[1],
    ...useHash(),
  });
  const data = props.data;
  const mapRef = useRef<MapRef>();

  const handleViewportChange = (viewport: ViewportProps) => {
    setViewport(viewport);
    props.setZoom(viewport.zoom);
  };

  const handleInteractionStateChange = (state: /* ExtraState */ any) => {
    const {
      isDragging,
      inTransition,
      isRotating,
      isZooming,
      isHovering,
      isPanning,
    } = state;
    if (
      isDragging ||
      inTransition ||
      isRotating ||
      isZooming ||
      isHovering ||
      isPanning
    )
      return;

    if (mapRef.current != null) {
      const map: MapboxMap = mapRef.current.getMap();
      const bounds = map.getBounds();

      props.updateBbox([
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ]);
    }
  };

  useEffect(() => {
    setViewport((old) => ({
      ...old,
      width: windowSize[0],
      height: windowSize[1],
    }));
  }, [windowSize]);

  // Give station icons and all labels the pointer cursor
  const interactiveLayerIds = props.showLineLabels
    ? Object.values(data)
        .filter(
          (value) =>
            value.metadata.filterKey == null ||
            props.lines[value.metadata.filterKey]
        )
        .flatMap((value) => {
          const id = value.metadata.id;
          if (value.metadata.type === "rail-line") {
            return [`${id}-station`, `${id}-labels`];
          } else if (value.metadata.type === "rail-yard") {
            return [`${id}-labels`];
          }
        })
    : [];

  const isDarkTheme = useIsDarkTheme(props.appTheme);

  const [style, setStyle] = useState(
    props.mapStyle === "satellite"
      ? "mapbox://styles/mapbox/satellite-streets-v11"
      : isDarkTheme
      ? "mapbox://styles/mapbox/dark-v10"
      : "mapbox://styles/mapbox/light-v10"
  );

  const [labelStyle, setLabelStyle] = useState<{}[]>([]);

  const handleClick = (event: MapEvent) => {
    event.features?.forEach((feature) => {
      if (feature.properties.url != null && feature.properties.url !== "null") {
        window.parent.location.href = `${BASE_URL}/${feature.properties.url}`;
      }
    });
  };

  useEffect(() => {
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

  useEffect(() => {
    setLabelStyle(provideLabelStyle(data, props.lines));
  }, [data, props.lines]);

  return (
    <Map
      ref={mapRef}
      mapStyle={style}
      {...viewport}
      onViewportChange={handleViewportChange}
      onInteractionStateChange={handleInteractionStateChange}
      onClick={handleClick}
      interactiveLayerIds={interactiveLayerIds}
      mapboxApiAccessToken={MAPBOX_KEY}
      scrollZoom={{ speed: 0.25, smooth: true }}
      mapOptions={{ hash: true }}
    >
      <AttributionControl />
      <LabelProviderContext.Provider value={{ labelStyle }}>
        {Object.values(data)
          .filter((entry) => entry.metadata.icon != null)
          .map((entry) => (
            <MapIcon
              style={style}
              width={16}
              height={16}
              id={entry.metadata.id}
              key={entry.metadata.id}
              url={`icons/${entry.metadata.icon}`}
            />
          ))}
        <MapIcon
          style={style}
          width={24}
          height={24}
          id="label-background"
          url={labelBackground}
        />
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
                name={data.metadata.id}
                key={data.metadata.id}
                offset={data.metadata.offset ?? 0}
                color={data.metadata.color ?? "#212121"}
                showLineLabels={props.showLineLabels}
                activeAlternatives={props.alternatives[data.metadata.filterKey]}
              />
            );
          } else if (
            data.metadata?.type === "rail-yard" &&
            (data.metadata.filterKey == null ||
              props.lines[data.metadata.filterKey])
          ) {
            return (
              <RailYard
                key={data.metadata.id}
                name={data.metadata.id}
                data={data}
                showLabels={props.showLineLabels}
                offset={data.metadata.offset ?? 0}
              />
            );
          }
        })}
      </LabelProviderContext.Provider>
    </Map>
  );
};

const mapStateToProps = (state: State) => ({
  show3DBuildings: state.show3DBuildings,
  appTheme: state.appTheme,
  mapStyle: state.mapStyle,
  lines: state.lines,
  accessibleLabels: state.accessibleLabels,
  targetZoom: state.targetZoom,
  alternatives: state.alternatives,
  showLineLabels: state.showLineLabels,
});

const mapDispatchToProps = {
  setTargetZoom,
  setZoom,
};

export const OverviewMap = connect(
  mapStateToProps,
  mapDispatchToProps
)(OverviewMapComponent);
