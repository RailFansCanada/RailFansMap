import React from "react";
import { useMediaQuery, MuiThemeProvider } from "@material-ui/core";
import { OverviewMap } from "../components/Map";
import { themeFactory } from "./theme";

type ThemeSetting = "light" | "dark" | "system";

export const App = () => {
  const [themeSetting] = React.useState<ThemeSetting>("system");

  const prefersDarkScheme = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(() => {
    const isDarkMode =
      (themeSetting === "system" && prefersDarkScheme) ||
      themeSetting === "dark";

    return themeFactory(isDarkMode);
  }, [prefersDarkScheme, themeSetting]);

  return (
    <MuiThemeProvider theme={theme}>
      <OverviewMap />
    </MuiThemeProvider>
  );
};
