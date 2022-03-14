import React from "react";
import styled from "styled-components";
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
import { ProvideData, useData } from "../hooks/useData";
import { ProvideWindow } from "../hooks/useWindow";
import { LegendDrawer } from "../components/settings/LegendDrawer";
import { ProvideMapTarget } from "../hooks/useMapTarget";
import { ProvideAppState, useAppState } from "../hooks/useAppState";
import { SearchBar } from "../components/SearchBar";

export const App = () => {
  return (
    <ProvideAppState>
      <ThemedApp />
    </ProvideAppState>
  );
};

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Content = () => {
  const { data, visible, agencies, updateBbox } = useData();

  return (
    <Container>
      <OverviewMap data={data} updateBbox={updateBbox} />
      <Controls />
      <SettingsDrawer />
      <LegendDrawer visible={visible} data={data} allAgencies={agencies} />
      <Logo />
      <SearchBar />
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
        <ProvideData>
          <ProvideWindow>
            <ProvideMapTarget>
              <Content />
            </ProvideMapTarget>
          </ProvideWindow>
        </ProvideData>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
