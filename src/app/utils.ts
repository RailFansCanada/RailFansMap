import { AppTheme } from "../redux";
import { useMediaQuery } from "@material-ui/core";

export const useIsDarkTheme = (appTheme: AppTheme): boolean => {
  const prefersDarkScheme = useMediaQuery("(prefers-color-scheme: dark)");
  return (appTheme === "system" && prefersDarkScheme) || appTheme === "dark";
};
