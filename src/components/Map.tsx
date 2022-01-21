import React, { useEffect, useRef, useState } from "react";
import MapGL, {
  Viewport,
  Layer,
  NavigationControl,
  Source,
  AttributionControl,
} from "@urbica/react-map-gl";
import {
  Map as MapboxMap,
  PaddingOptions,
} from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { Lines } from "./Line";

import { isLineEnabled, useIsDarkTheme } from "../app/utils";
import { Dataset } from "../hooks/useData";
import { MapIcon } from "./Icons";
import { useWindow } from "../hooks/useWindow";
import labelBackground from "../images/label.svg";
import { BBox, FeatureCollection } from "geojson";
import { SimpleBBox, useMapTarget } from "../hooks/useMapTarget";
import {
  LineFilterState,
  useAppState,
  ViewportSettings,
} from "../hooks/useAppState";
import { useTheme } from "@mui/styles";
import { config } from "../config";

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
        isLineEnabled(value.metadata.filterKey, state)
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

const regionFeatures = config.regions.map((region) => ({
  type: "Feature",
  bbox: region.bbox,
  geometry: {
    type: "Point",
    coordinates: region.location,
  },
  properties: {
    type: "region-label",
    id: region.id,
    name: region.title,
    target: region.bbox,
  },
}));
const regionData = { type: "FeatureCollection", features: regionFeatures };

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
    setLastLocation,
  } = useAppState();

  // Used to restore last location if no location hash is provided
  const lastLocation: ViewportSettings =
    localStorage["settings"] != null
      ? JSON.parse(localStorage["settings"]).lastLocation
      : null;

  const data = props.data;
  const mapRef = useRef<MapGL>();
  const [fullData, setFullData] = useState<FeatureCollection | null>(null);
  // TODO: Fix?
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  const [viewport, setViewport] = useState<Viewport>(
    lastLocation
      ? {
          longitude: lastLocation[0],
          latitude: lastLocation[1],
          zoom: lastLocation[2],
          bearing: lastLocation[3],
        }
      : {
          longitude: -79.3934,
          latitude: 43.7169,
          zoom: 11.25,
        }
  );

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
    setLastLocation([v.longitude, v.latitude, v.zoom, v.bearing ?? 0]);

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
    if (event.features == null) return;

    for (let feature of event.features) {
      if (feature.properties.type === "station-label") {
        if (
          feature.properties.url != null &&
          feature.properties.url !== "null"
        ) {
          window.parent.location.href = `${BASE_URL}/${feature.properties.url}`;
        }
        break;
      } else if (feature.properties.type === "region-label") {
        setMapTarget(JSON.parse(feature.properties.target) as SimpleBBox);
        break;
      }
    }
  };

  const handleMouseEnter = (e: any) => {
    const canvas = mapRef.current?.getMap()?.getCanvas();
    if (canvas == null) return;

    canvas.style.cursor = "pointer";
  };

  const handleMouseLeave = (e: any) => {
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
      .filter((entry) =>
        isLineEnabled(entry.metadata.filterKey, lineFilterState)
      )
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

  const clickableLayers = [
    "rail-station",
    "rail-labels",
    "yard-labels",
    "regions-labels",
  ];

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
      attributionControl={false}
    >
      {mapLoaded && (
        <>
          <Source
            id="regions"
            type="geojson"
            data={regionData as FeatureCollection}
          />
          <AttributionControl
            compact={false}
            position="bottom-right"
            customAttribution={`Updated on ${new Date(
              BUILD_DATE
            ).toLocaleDateString()}`}
          />
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
          <Layer
            id="regions-labels"
            source="regions"
            type="symbol"
            layout={{
              "text-field": ["get", "name"],
              "text-size": 20,
            }}
            paint={{
              "text-color": isDarkTheme ? "#FFFFFF" : "#121212",
              "text-halo-color": isDarkTheme ? "#121212" : "#FFFFFF",
              "text-halo-width": 2,
            }}
            maxzoom={9}
          />
        </>
      )}
    </MapGL>
  );
};
