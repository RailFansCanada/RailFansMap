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
