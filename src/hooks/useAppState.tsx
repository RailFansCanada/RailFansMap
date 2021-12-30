import produce from "immer";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type AppTheme = "system" | "light" | "dark";
export type MapStyle = "vector" | "satellite";

export type LineFilterState = {
  [key: string]: boolean;
};

export type LegendGroupState = {
  [key: string]: boolean;
};

type AppState = {
  settingsDrawerOpen: boolean;
  legendDrawerOpen: boolean;
  shareSheetOpen: boolean;

  show3DBuildings: boolean;
  showLabels: boolean;
  appTheme: AppTheme;
  mapStyle: MapStyle;

  lineFilterState: LineFilterState;
  legendGroupState: LegendGroupState;
};

type AppStateActions = {
  setSettingsDrawerOpen: (open: boolean) => void;
  setLegendDrawerOpen: (open: boolean) => void;
  setShareSheetOpen: (open: boolean) => void;

  setShow3DBuildings: (show: boolean) => void;
  setShowLabels: (show: boolean) => void;
  setAppTheme: (theme: AppTheme) => void;
  setMapStyle: (style: MapStyle) => void;

  setLineFiltered: (filterKey: string, show: boolean) => void;
  setLegendGroupOpen: (key: string, open: boolean) => void;
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

  localStorage["settings"] = JSON.stringify({ ...rest, version: "3.2" });
};

const useProvideAppContext = (): UseAppState => {
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [legendDrawerOpen, setLegendDrawerOpen] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  const [show3DBuildings, setShow3DBuildings] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [appTheme, setAppTheme] = useState<AppTheme>("system");
  const [mapStyle, setMapStyle] = useState<MapStyle>("vector");

  const [lineFilterState, setLineFilterState] = useState<LineFilterState>({});
  const [legendGroupState, setLegendGroupState] = useState<LegendGroupState>(
    {}
  );

  // Load initial state from localstorage and param overrides
  useEffect(() => {
    const saved = readLocalSettings();
    const params = readSearchParamsSettings();

    const merged = {
      ...saved,
      ...params,
      lineFilterState: { ...saved.lineFilterState, ...params.lineFilterState },
    };

    setShow3DBuildings(merged.show3DBuildings ?? false);
    setShowLabels(merged.showLabels ?? true);
    setAppTheme(merged.appTheme ?? "system");
    setMapStyle(merged.mapStyle ?? "vector");
    setLineFilterState(merged.lineFilterState ?? {});
    setLegendGroupState(merged.legendGroupState ?? {});
  }, []);

  const setLineFiltered = (filterKey: string, show: boolean) => {
    setLineFilterState({ ...lineFilterState, [filterKey]: show });
  };

  const setLegendGroupOpen = (key: string, open: boolean) => {
    setLegendGroupState({ ...legendGroupState, [key]: open });
  };

  const state = {
    settingsDrawerOpen,
    setSettingsDrawerOpen,

    legendDrawerOpen,
    setLegendDrawerOpen,

    shareSheetOpen,
    setShareSheetOpen,

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
