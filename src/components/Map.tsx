import React, { useEffect, useRef, useState, useCallback } from "react";
import Map, {
  ViewState,
  MapRef,
  ViewStateChangeEvent,
  Layer,
  Source,
  AttributionControl,
  Popup,
  MapEvent,
} from "react-map-gl";
import { PaddingOptions } from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { Lines } from "./Line";

import { isLineEnabled, useIsDarkTheme } from "../app/utils";
import { MapIcon } from "./Icons";
import { useWindow } from "../hooks/useWindow";
import labelBackground from "../images/label.png";
import { FeatureCollection, Position } from "geojson";
import { SimpleBBox, useMapTarget } from "../hooks/useMapTarget";
import {
  LineFilterState,
  useAppState,
  ViewportSettings,
} from "../hooks/useAppState";
import { useTheme } from "@mui/styles";
import { config, Metadata } from "../config";
import { MapControls } from "./MapControls";
import { useGeolocation } from "../hooks/useGeolocation";
import bboxPolygon from "@turf/bbox-polygon";
import { postNewBounds } from "../contexts/MapBoundsContext";

const provideLabelStyle = (
  lines: { [key: string]: Metadata },
  state: LineFilterState
) => [
  "format",
  ["get", "name"],
  {},
  " ",
  {},
  ...Object.values(lines)
    .filter(
      (value) => value.icon != null && isLineEnabled(value.filterKey, state)
    )
    .map((value) => value.id)
    .sort()
    .flatMap((id) => [
      [
        "case",
        ["in", USE_TILES ? `\"${id}\"` : id, ["get", "lines"]],
        ["image", id],
        "",
      ],
      {},
    ]),
];

// Provides a list of all state keys that are false, i.e. the features to hide
const provideFilterList = (
  state: LineFilterState,
  lines: Metadata[]
): string[] => {
  const fullState = { ...state };
  lines
    .filter((line) => !line.filterKey?.startsWith("!"))
    .forEach((line) => {
      if (line.filterKey && !fullState.hasOwnProperty(line.filterKey)) {
        fullState[line.filterKey] = false;
      }
    });

  const basic = Object.entries(fullState)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  const inverse = Object.entries(fullState)
    .filter(([_, value]) => value)
    .map(([key]) => `!${key}`);

  return [...basic, ...inverse];
};

type LabelProvider = {
  labelStyle: {}[];
};

export const LabelProviderContext = React.createContext<LabelProvider>({
  labelStyle: [],
});

export type OverviewMapProps = {
  lines: { [key: string]: Metadata };
};

const regionFeatures = config.regions.flatMap((region) => [
  {
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
  },
  bboxPolygon(region.bbox, {
    properties: {
      type: "region-bounds",
      id: region.id,
      name: region.title,
      target: region.bbox,
    },
  }),
]);
const regionData = { type: "FeatureCollection", features: regionFeatures };

// Used to restore last location if no location hash is provided
const lastLocation: ViewportSettings =
  localStorage["viewport"] != null
    ? JSON.parse(localStorage["viewport"])
    : null;

const initialLocation: Partial<ViewState> = lastLocation
  ? {
      longitude: lastLocation[0],
      latitude: lastLocation[1],
      zoom: lastLocation[2],
      bearing: lastLocation[3],
    }
  : {
      longitude: -75.700,
      latitude: 45.350,
      zoom: 10.50,
    };

function persistLastLocation(viewport: ViewportSettings) {
  localStorage["viewport"] = JSON.stringify(viewport);
}

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
    showGeolocation,
    debugShowRegionBounds,
    setMapBounds,
  } = useAppState();

  const mapRef = useRef<MapRef>();

  const { target: mapTarget, setTarget: setMapTarget } = useMapTarget();
  useEffect(() => {
    if (mapTarget != null) {
      const map = mapRef.current?.getMap();

      map?.fitBounds(mapTarget, {
        padding: 64,
      });
    }
  }, [mapTarget]);

  const handleViewportChange = (e: ViewStateChangeEvent) => {
    setMapTarget(undefined);
    const { longitude, latitude, zoom, bearing } = e.viewState;
    persistLastLocation([longitude, latitude, zoom, bearing ?? 0]);
    postNewBounds(e.target.getBounds());
  };

  const handleMapMove = (e: ViewStateChangeEvent) => {
    postNewBounds(e.target.getBounds());
  };

  const handleMapIdle = (e: MapEvent) => {
    postNewBounds(e.target.getBounds());
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
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/streets-v12"
  );

  const [labelStyle, setLabelStyle] = useState<{}[]>([]);

  const [popupTarget, setPopupTarget] = useState<Position>(null);

  const handleClick = (event: any) => {
    if (event.features == null) return;

    for (let feature of event.features) {
      if (feature.properties.type === "station-label") {
        if (
          feature.properties.url != null &&
          feature.properties.url !== "null"
        ) {
          window.parent.location.href = feature.properties.url;
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
    if (e.features.length > 0) {
      const feature = e.features[0];
      if (feature.properties.url != null && feature.geometry.type === "Point") {
        setPopupTarget(feature.geometry.coordinates);
      }
    }
  };

  const handleMouseLeave = (e: any) => {
    const canvas = mapRef.current?.getMap()?.getCanvas();
    if (canvas == null) return;

    canvas.style.cursor = "";
    setPopupTarget(null);
  };

  useEffect(() => {
    if (mapStyle === "satellite") {
      setStyle("mapbox://styles/mapbox/satellite-streets-v11");
    } else {
      setStyle(
        isDarkTheme
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/streets-v12"
      );
    }
  }, [isDarkTheme, appTheme, mapStyle]);

  useEffect(() => {
    setLabelStyle(provideLabelStyle(props.lines, lineFilterState));
  }, [props.lines, lineFilterState]);

  const [clickableLayers, setClickableLayers] = useState([]);

  useEffect(() => {
    if (showLabels) {
      setClickableLayers([
        "rail-station",
        "rail-labels",
        "yard-labels",
        "regions-labels",
      ]);
    } else {
      setClickableLayers(["rail-station", "regions-labels"]);
    }
  }, [showLabels]);

  const { geolocation: userPosition } = useGeolocation();

  return (
    <Map
      style={{ width: windowSize[0], height: windowSize[1] }}
      mapStyle={style}
      mapboxAccessToken={MAPBOX_KEY}
      hash={true}
      onMoveEnd={handleViewportChange}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMove={handleMapMove}
      onIdle={handleMapIdle}
      ref={mapRef}
      initialViewState={initialLocation}
      attributionControl={false}
      maxPitch={85}
      interactiveLayerIds={clickableLayers}
    >
      <AttributionControl
        compact={windowSize[0] <= 600}
        position="bottom-right"
        customAttribution={`Updated on ${new Date(
          BUILD_DATE
        ).toLocaleDateString()}`}
      />
      <LabelProviderContext.Provider value={{ labelStyle }}>
        {Object.values(props.lines)
          .filter((entry) => entry.icon != null)
          .map((entry) => (
            <MapIcon
              style={style}
              width={16}
              height={16}
              id={entry.id}
              key={entry.id}
              url={`icons/${entry.icon}`}
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
          paint={{
            "sky-atmosphere-sun": isDarkTheme ? [0, 95] : [0, 0],
          }}
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
        <Lines
          showLineLabels={showLabels}
          filterList={provideFilterList(
            lineFilterState,
            Object.values(props.lines)
          )}
        />
      </LabelProviderContext.Provider>
      <Source
        id="regions"
        type="geojson"
        data={regionData as FeatureCollection}
      >
        <Layer
          id="regions-labels"
          type="symbol"
          filter={["==", ["get", "type"], "region-label"]}
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
        {DEBUG && debugShowRegionBounds && (
          <Layer
            id="regions-bounds"
            type="line"
            filter={["==", ["get", "type"], "region-bounds"]}
            paint={{
              "line-color": "#00FFFF",
            }}
          />
        )}
      </Source>
      {popupTarget && (
        <Popup
          longitude={popupTarget[0]}
          latitude={popupTarget[1]}
          closeButton={false}
          anchor="top-left"
          offset={4}
          className="mapbox-popup"
        >
          View Station Profile
        </Popup>
      )}
      {showGeolocation && userPosition && (
        <Source
          type="geojson"
          data={{
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: { type: "Point", coordinates: userPosition },
                properties: {},
              },
            ],
          }}
        >
          <Layer
            id="geolocation-circle-glow"
            type="circle"
            paint={{
              "circle-color": "#5fb7ff",
              "circle-radius": 12,
              "circle-blur": 1,
            }}
          />
          <Layer
            id="geolocation-circle"
            type="circle"
            paint={{
              "circle-color": "#038cfc",
              "circle-radius": 6,
              "circle-stroke-color": "#FFFFFF",
              "circle-stroke-width": 2,
            }}
          />
        </Source>
      )}
      <MapControls />
    </Map>
  );
};
