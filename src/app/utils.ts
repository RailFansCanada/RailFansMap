import { useMediaQuery } from "@mui/material";
import type { AppTheme, LineFilterState } from "../hooks/useAppState";

export const useIsDarkTheme = (appTheme: AppTheme): boolean => {
  const prefersDarkScheme = useMediaQuery("(prefers-color-scheme: dark)");
  return (appTheme === "system" && prefersDarkScheme) || appTheme === "dark";
};

export const isLineEnabled = (filterKey: string | undefined, state: LineFilterState): boolean => {
  if (filterKey === undefined) return true;

  if (filterKey.startsWith("!")) {
    const parts = filterKey.split(",");
    let result = true;
    parts.forEach(part => {
      result &&= !(state[part.slice(1)] ?? false);
    })
    return result;
  } else {
    return state[filterKey] ?? false;
  }
}

// Planned and under-construction route IDs, based on the line data currently
// included in the map. Keep these separate from filterKey: some operating
// services also use filter keys so riders can hide them.
const UNBUILT_LINE_IDS = new Set([
  "ottawa/barrhaven",
  "ottawa/kanata",
  "edmonton/valleylinew",
  "montreal/blue-extension",
  "toronto/ynse",
  "toronto/sse",
  "toronto/3ontario",
  "toronto/5-west",
  "waterloo/ion-stage2",
  "quebec/tramway",
  "gatineau/A",
  "gatineau/B",
  "hamilton/lrt",
  "northland/northlander",
  "translink/broadwayextension",
]);

export const isLineUnbuilt = (lineId: string): boolean =>
  UNBUILT_LINE_IDS.has(lineId);
