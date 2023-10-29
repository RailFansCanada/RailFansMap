import { produce } from "immer";
import { LngLatBounds, LngLatBoundsLike } from "mapbox-gl";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useData2 } from "./useData";
import booleanOverlap from "@turf/boolean-overlap";
import bboxPolygon from "@turf/bbox-polygon";
import { BBox } from "geojson";
import booleanContains from "@turf/boolean-contains";
import booleanIntersects from "@turf/boolean-intersects";
import { Region } from "../config";

export type AppTheme = "system" | "light" | "dark";
export type MapStyle = "vector" | "satellite";

export type LineFilterState = {
  [key: string]: boolean;
};

export type LegendGroupState = {
  [key: string]: boolean;
};

export type ViewportSettings = [
  lng: number,
  lat: number,
  zoom: number,
  bearing: number
];

type AppState = {
  settingsDrawerOpen: boolean;
  legendDrawerOpen: boolean;
  shareSheetOpen: boolean;
  searchOpen: boolean;

  show3DBuildings: boolean;
  showLabels: boolean;
  appTheme: AppTheme;
  mapStyle: MapStyle;

  lineFilterState: LineFilterState;
  legendGroupState: LegendGroupState;

  showGeolocation: boolean;
  mapBounds: LngLatBounds;

  visibleRegions: Region[];

  debugShowRegionBounds: boolean;
};

type AppStateActions = {
  setSettingsDrawerOpen: (open: boolean) => void;
  setLegendDrawerOpen: (open: boolean) => void;
  setShareSheetOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;

  setShow3DBuildings: (show: boolean) => void;
  setShowLabels: (show: boolean) => void;
  setAppTheme: (theme: AppTheme) => void;
  setMapStyle: (style: MapStyle) => void;

  setLineFiltered: (filterKey: string, show: boolean) => void;
  setLegendGroupOpen: (key: string, open: boolean) => void;

  setShowGeolocation: (show: boolean) => void;
  setMapBounds: (bounds: LngLatBounds) => void;

  setDebugShowRegionBounds: (show: boolean) => void;
};

type UseAppState = AppState & AppStateActions;

const AppStateContext = createContext<UseAppState>(null);

// Read settings saved in LocalStorage
const readLocalSettings = (): Partial<AppState> => {
  if (localStorage["settings"] == null) return {};
  const saved = JSON.parse(localStorage["settings"]);

  if (saved.version == null) {
    const { showLineLabels, ...rest } = saved;
    return { ...rest, showLabels: showLineLabels };
  } else if (saved.version < "3.4.2") {
    return { ...saved, showLabels: true };
  } else {
    return saved;
  }
};

// Read settings overrides from URL search params
const readSearchParamsSettings = (): Partial<AppState> => {
  const params = new URLSearchParams(location.search);
  return produce<Partial<AppState>>({}, (draft) => {
    if (params.get("map")?.includes("satellite")) {
      draft.mapStyle = "satellite";
    } else if (params.get("map")?.includes("vector")) {
      draft.mapStyle = "vector";
    }

    if (params.get("theme")?.includes("light")) {
      draft.appTheme = "light";
    } else if (params.get("theme")?.includes("dark")) {
      draft.appTheme = "dark";
    }

    if (params.get("show")) {
      const keys = params.get("show").split(",");
      draft.lineFilterState = {};
      keys.forEach((key) => {
        draft.lineFilterState[key] = true;
      });
    }
  });
};

const writeSettings = (state: AppState) => {
  const { settingsDrawerOpen, legendDrawerOpen, shareSheetOpen, ...rest } =
    state;

  localStorage["settings"] = JSON.stringify({ ...rest, version: "3.4.2" });
};

const saved = readLocalSettings();
const params = readSearchParamsSettings();

const merged = {
  ...saved,
  ...params,
  lineFilterState: { ...saved.lineFilterState, ...params.lineFilterState },
};

const useProvideAppContext = (): UseAppState => {
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [legendDrawerOpen, setLegendDrawerOpen] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [show3DBuildings, setShow3DBuildings] = useState(
    merged.show3DBuildings ?? false
  );
  const [showLabels, setShowLabels] = useState(merged.showLabels ?? true);
  const [appTheme, setAppTheme] = useState<AppTheme>(
    merged.appTheme ?? "system"
  );
  const [mapStyle, setMapStyle] = useState<MapStyle>(
    merged.mapStyle ?? "vector"
  );

  const [lineFilterState, setLineFilterState] = useState<LineFilterState>(
    merged.lineFilterState ?? {}
  );
  const [legendGroupState, setLegendGroupState] = useState<LegendGroupState>(
    merged.legendGroupState ?? {}
  );

  const setLineFiltered = (filterKey: string, show: boolean) => {
    setLineFilterState({ ...lineFilterState, [filterKey]: show });
  };

  const setLegendGroupOpen = (key: string, open: boolean) => {
    setLegendGroupState({ ...legendGroupState, [key]: open });
  };

  const [showGeolocation, setShowGeolocation] = useState(
    merged.showGeolocation ?? true
  );

  const [debugShowRegionBounds, setDebugShowRegionBounds] = useState(
    merged.debugShowRegionBounds ?? false
  );

  const [mapBounds, setMapBounds] = useState(new LngLatBounds([0, 0, 0, 0]));
  const [visibleRegions, setVisibleRegions] = useState<Region[]>([]);

  const { regions } = useData2();
  useEffect(() => {
    const bbox = bboxPolygon(mapBounds.toArray().flat() as BBox);
    const results = Object.values(regions).filter((r) =>
      booleanIntersects(bbox, bboxPolygon(r.bbox))
    );
    setVisibleRegions(results);
  }, [regions, mapBounds]);

  const state = {
    settingsDrawerOpen,
    setSettingsDrawerOpen,

    legendDrawerOpen,
    setLegendDrawerOpen,

    shareSheetOpen,
    setShareSheetOpen,

    searchOpen,
    setSearchOpen,

    show3DBuildings,
    setShow3DBuildings,

    showLabels,
    setShowLabels,

    appTheme,
    setAppTheme,

    mapStyle,
    setMapStyle,

    lineFilterState,
    setLineFiltered,

    legendGroupState,
    setLegendGroupOpen,

    showGeolocation,
    setShowGeolocation,

    debugShowRegionBounds,
    setDebugShowRegionBounds,

    mapBounds,
    setMapBounds,

    visibleRegions,
  };

  // Write settings to localstorage on every update
  useEffect(() => {
    writeSettings(state);
  });

  return state;
};

export const ProvideAppState = (props: { children: ReactNode }) => {
  const state = useProvideAppContext();

  return (
    <AppStateContext.Provider value={state}>
      {props.children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
