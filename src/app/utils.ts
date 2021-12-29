import { AppTheme } from "../redux";
import { useMediaQuery } from "@mui/material";

export const useIsDarkTheme = (appTheme: AppTheme): boolean => {
  const prefersDarkScheme = useMediaQuery("(prefers-color-scheme: dark)");
  return (appTheme === "system" && prefersDarkScheme) || appTheme === "dark";
};
