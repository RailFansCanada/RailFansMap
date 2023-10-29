import React from "react";
import styled from "@emotion/styled";
import {
  useMediaQuery,
  ThemeProvider,
  StyledEngineProvider,
} from "@mui/material";
import { OverviewMap } from "../components/Map";
import { themeFactory } from "./theme";
import { Controls } from "../components/settings/Controls";
import { SettingsDrawer } from "../components/settings/SettingsDrawer";
import { Logo } from "../components/Logo";
import { ProvideData2, useData2 } from "../hooks/useData";
import { ProvideWindow } from "../hooks/useWindow";
import { LegendDrawer } from "../components/settings/LegendDrawer";
import { ProvideMapTarget } from "../hooks/useMapTarget";
import { ProvideAppState, useAppState } from "../hooks/useAppState";
import { SearchBar } from "../components/SearchBar";
import { ProvideGeolocation } from "../hooks/useGeolocation";
import { ProvideStrings } from "../hooks/useStrings";
import { BottomSheet } from "../components/BottomSheet";
import { MapBoundsProvider } from "../contexts/MapBoundsContext";

export const App = () => {
  return (
    <ProvideData2>
      <ProvideAppState>
        <ThemedApp />
      </ProvideAppState>
    </ProvideData2>
  );
};

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Content = () => {
  const { agencies, lines } = useData2();

  return (
    <Container>
      <OverviewMap lines={lines} />
      <Controls />
      <SettingsDrawer />
      <LegendDrawer allAgencies={agencies} />
      <Logo />
      <SearchBar />
      {DEBUG && <BottomSheet />}
    </Container>
  );
};

const ThemedApp = () => {
  const prefersDarkScheme = useMediaQuery("(prefers-color-scheme: dark)");
  const { appTheme } = useAppState();
  const theme = React.useMemo(() => {
    const isDarkMode =
      (appTheme === "system" && prefersDarkScheme) || appTheme === "dark";

    return themeFactory(isDarkMode);
  }, [prefersDarkScheme, appTheme]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <ProvideStrings>
          <ProvideWindow>
            <ProvideMapTarget>
              <MapBoundsProvider>
                <ProvideGeolocation>
                  <Content />
                </ProvideGeolocation>
              </MapBoundsProvider>
            </ProvideMapTarget>
          </ProvideWindow>
        </ProvideStrings>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
