import React, { useEffect, useRef, useState } from "react";
import MapGL, {
  Viewport,
  Layer,
  NavigationControl,
} from "@urbica/react-map-gl";
import {
  Map as MapboxMap,
  MapboxGeoJSONFeature,
  PaddingOptions,
} from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { Lines } from "./Line";

import { useIsDarkTheme } from "../app/utils";
import { Dataset } from "../hooks/useData";
import { MapIcon } from "./Icons";
import { useWindow } from "../hooks/useWindow";
import labelBackground from "../images/label.svg";
import { BBox, FeatureCollection } from "geojson";
import { useMapTarget } from "../hooks/useMapTarget";
import { LineFilterState, useAppState } from "../hooks/useAppState";
import { useTheme } from "@mui/styles";

const provideLabelStyle = (mapData: Dataset, state: LineFilterState) => [
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

type LabelProvider = {
  labelStyle: {}[];
};

export const LabelProviderContext = React.createContext<LabelProvider>({
  labelStyle: [],
});

export type OverviewMapProps = {
  data: Dataset;
  updateBbox(bbox: BBox): void;
};

export const OverviewMap = (props: OverviewMapProps) => {
  const theme = useTheme();
  const windowSize = useWindow();
  const {
    legendDrawerOpen,
    settingsDrawerOpen,
    appTheme,
    mapStyle,
    show3DBuildings,
    showLabels,
    lineFilterState,
  } = useAppState();

  const data = props.data;
  const mapRef = useRef<MapGL>();
  const [fullData, setFullData] = useState<FeatureCollection | null>(null);
  // TODO: Fix?
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  const [viewport, setViewport] = useState<Viewport>({
    longitude: -77.653,
    latitude: 44.655,
    zoom: 7,
  });

  const { target: mapTarget, setTarget: setMapTarget } = useMapTarget();
  useEffect(() => {
    if (mapTarget != null) {
      const map = mapRef.current?.getMap();

      map?.fitBounds(mapTarget, {
        padding: 64,
      });
    }
  }, [mapTarget]);

  const handleViewportChange = (v: Viewport) => {
    setViewport(v);
    setMapTarget(undefined);

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
    const open = settingsDrawerOpen || legendDrawerOpen;

    // On small screens the drawer takes up entire screen width so padding is useless
    if (windowSize[0] > theme.breakpoints.values.md) {
      const padding = { right: open ? 420 : 0 } as PaddingOptions;
      mapRef.current?.getMap()?.easeTo({ padding });
    }
  }, [settingsDrawerOpen, legendDrawerOpen, windowSize]);

  const isDarkTheme = useIsDarkTheme(appTheme);

  const [style, setStyle] = useState(
    mapStyle === "satellite"
      ? "mapbox://styles/mapbox/satellite-streets-v11"
      : isDarkTheme
      ? "mapbox://styles/mapbox/dark-v10"
      : "mapbox://styles/mapbox/light-v10"
  );

  const [labelStyle, setLabelStyle] = useState<{}[]>([]);

  const handleClick = (event: any) => {
    event.features?.forEach((feature: MapboxGeoJSONFeature) => {
      if (feature.properties.url != null && feature.properties.url !== "null") {
        window.parent.location.href = `${BASE_URL}/${feature.properties.url}`;
      }
    });
  };

  const handleMouseEnter = () => {
    const canvas = mapRef.current?.getMap()?.getCanvas();
    if (canvas == null) return;

    canvas.style.cursor = "pointer";
  };

  const handleMouseLeave = () => {
    const canvas = mapRef.current?.getMap()?.getCanvas();
    if (canvas == null) return;

    canvas.style.cursor = "";
  };

  useEffect(() => {
    if (mapStyle === "satellite") {
      setStyle("mapbox://styles/mapbox/satellite-streets-v11");
    } else {
      setStyle(
        isDarkTheme
          ? "mapbox://styles/mapbox/dark-v10"
          : "mapbox://styles/mapbox/light-v10"
      );
    }
  }, [isDarkTheme, appTheme, mapStyle]);

  useEffect(() => {
    setLabelStyle(provideLabelStyle(data, lineFilterState));
  }, [data, lineFilterState]);

  // TODO: Move this to useData
  useEffect(() => {
    const allFeatures = Object.values(data)
      .filter((entry) => {
        return (
          entry.metadata.filterKey == null ||
          lineFilterState[entry.metadata.filterKey]
        );
      })
      .flatMap(
        (entry) =>
          entry.features.map((feature) => ({
            ...feature,
            properties: {
              ...feature.properties,
              class: entry.metadata.type,
              color: entry.metadata.color,
              offset: entry.metadata.offset,
              alternatives: feature.properties.alternatives,
            },
          }))
        // .filter(
        //   (feature) =>
        //     feature.properties.alternatives == null ||
        //     feature.properties.alternatives.some((a: string) =>
        //       props.alternatives[entry.metadata.filterKey]?.includes(a)
        //     )
        // )
      );

    setFullData({
      type: "FeatureCollection",
      features: allFeatures,
    });
  }, [data, lineFilterState]);

  const clickableLayers = ["rail-station", "rail-labels", "yard-labels"];

  return (
    <MapGL
      style={{ width: windowSize[0], height: windowSize[1] }}
      mapStyle={style}
      accessToken={MAPBOX_KEY}
      hash={true}
      onViewportChange={handleViewportChange}
      onClick={[clickableLayers, handleClick]}
      onMouseenter={[clickableLayers, handleMouseEnter]}
      onMouseleave={[clickableLayers, handleMouseLeave]}
      onLoad={() => {
        setMapLoaded(true);
      }}
      ref={mapRef}
      {...viewport}
    >
      {mapLoaded && (
        <>
          <NavigationControl showCompass showZoom position="bottom-right" />
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
            <Layer
              id="sky"
              type="sky"
              paint={
                {
                  "sky-atmosphere-sun": isDarkTheme ? [0, 95] : [0, 0],
                } as unknown
              }
            />

            {show3DBuildings && (
              <Layer
                id="3d-buildings"
                source="composite"
                {...{ "source-layer": "building" }}
                filter={["==", "extrude", "true"]}
                type="fill-extrusion"
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
            <Lines data={fullData} showLineLabels={showLabels} />
          </LabelProviderContext.Provider>
        </>
      )}
    </MapGL>
  );
};
