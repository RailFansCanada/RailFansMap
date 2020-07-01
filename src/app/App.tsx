import React from "react";
import { useMediaQuery, MuiThemeProvider } from "@material-ui/core";
import { OverviewMap } from "../components/Map";
import { themeFactory } from "./theme";
import { Controls } from "../components/settings/Controls";
import { SettingsDrawer } from "../components/settings/SettingsDrawer";
import { reducer, AppTheme, State } from "../redux";
import { configureStore } from "@reduxjs/toolkit";
import { Provider, connect } from "react-redux";
import { MapControls } from "../components/MapControls";
import { Logo } from "../components/Logo";

const store = configureStore({
  reducer,
  preloadedState:
    localStorage["settings"] && JSON.parse(localStorage["settings"]),
});

// Write current settings to localStorage
store.subscribe(() => {
  const { targetZoom, drawerOpen, ...rest } = store.getState();
  localStorage["settings"] = JSON.stringify(rest);
});

export const App = () => {
  return (
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  );
};

const ThemedAppComponent = (props: { appTheme: AppTheme }) => {
  const prefersDarkScheme = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(() => {
    const isDarkMode =
      (props.appTheme === "system" && prefersDarkScheme) ||
      props.appTheme === "dark";

    return themeFactory(isDarkMode);
  }, [prefersDarkScheme, props.appTheme]);

  return (
    <MuiThemeProvider theme={theme}>
      <div style={{ display: "flex" }}>
        <OverviewMap />
        <Controls />
        <MapControls />
        <SettingsDrawer />
        <Logo />
      </div>
    </MuiThemeProvider>
  );
};

const mapStateToProps = (state: State) => ({
  appTheme: state.appTheme,
});

const ThemedApp = connect(mapStateToProps)(ThemedAppComponent);
