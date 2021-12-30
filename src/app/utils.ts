import { useMediaQuery } from "@mui/material";
import type { AppTheme } from "../hooks/useAppState";

export const useIsDarkTheme = (appTheme: AppTheme): boolean => {
  const prefersDarkScheme = useMediaQuery("(prefers-color-scheme: dark)");
  return (appTheme === "system" && prefersDarkScheme) || appTheme === "dark";
};
