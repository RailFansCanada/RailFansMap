import React from "react";
import {
  Typography,
  List,
  Divider,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import { LayerOption } from "./LayerOption";
import { SwitchOption, MenuOption } from "./ListOptions";
import { MenuDrawer } from "./MenuDrawer";
import { useAppState, AppTheme } from "../../hooks/useAppState";
import styled from "@emotion/styled";

const themeSettings = ["Follow System Settings", "Light", "Dark"];

const appThemeToIndex = (appTheme: AppTheme) => {
  if (appTheme === "system") {
    return 0;
  } else if (appTheme === "light") {
    return 1;
  } else {
    return 2;
  }
};

const SectionHeader = styled(Typography)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(0, 2)};
  margin: ${({ theme }) => theme.spacing(2, 0, 0, 0)};
  box-sizing: border-box;
  display: block;
`;

export const SettingsDrawer = () => {
  const {
    settingsDrawerOpen,
    setSettingsDrawerOpen,
    show3DBuildings,
    setShow3DBuildings,
    showLabels,
    setShowLabels,
    mapStyle,
    setMapStyle,
    appTheme,
    setAppTheme,
    showGeolocation,
    setShowGeolocation,
    debugShowRegionBounds,
    setDebugShowRegionBounds,
  } = useAppState();

  const handleThemeChange = (index: number) => {
    switch (index) {
      case 0: {
        setAppTheme("system");
        break;
      }
      case 1: {
        setAppTheme("light");
        break;
      }
      case 2: {
        setAppTheme("dark");
        break;
      }
    }
  };

  return (
    <MenuDrawer
      open={settingsDrawerOpen}
      onClose={() => {
        setSettingsDrawerOpen(false);
      }}
      title="Map Settings"
    >
      <SectionHeader variant="overline">Map Type</SectionHeader>
      <LayerOption
        primary="Map View"
        secondary="Basic map in either light or dark themes"
        selected={mapStyle === "vector"}
        onClick={() => setMapStyle("vector")}
      />
      <LayerOption
        primary="Satellite View"
        secondary="Satellite imagery"
        selected={mapStyle === "satellite"}
        onClick={() => setMapStyle("satellite")}
      />
      <Divider />

      <SectionHeader variant="overline">Additional Settings</SectionHeader>

      <List>
        <SwitchOption
          primary="Show 3D buildings"
          checked={show3DBuildings}
          onToggle={(checked) => setShow3DBuildings(checked)}
        />
        {/* <SwitchOption
              primary="Show street names on Satellite view"
              checked={props.showSatelliteLabels}
              disabled={props.mapStyle != "satellite"}
              onToggle={(checked) => props.setShowSatelliteLabels(checked)}
            /> */}
        <SwitchOption
          primary="Show station labels"
          checked={showLabels}
          onToggle={(checked) => setShowLabels(checked)}
        />
        <MenuOption
          primary="Choose theme"
          options={themeSettings}
          value={appThemeToIndex(appTheme)}
          onChange={handleThemeChange}
        />
        <SwitchOption
          primary="Show Geolocation on Map"
          checked={showGeolocation}
          onToggle={(checked) => setShowGeolocation(checked)}
        />
      </List>

      {DEBUG && (
        <>
          <Divider />
          <SectionHeader variant="overline">Debug Settings</SectionHeader>
          <List>
            <SwitchOption
              primary="Show Region Bounds"
              checked={debugShowRegionBounds}
              onToggle={(checked) => setDebugShowRegionBounds(checked)}
            />
          </List>
        </>
      )}

      <Divider />
      <SectionHeader variant="overline">About</SectionHeader>
      <List>
        <ListItemButton href="https://www.iubenda.com/privacy-policy/15954265">
          <ListItemText primary="Privacy policy" />
        </ListItemButton>
        <ListItem dense>
          <ListItemText primary="Version" secondary={VERSION} />
        </ListItem>
        <ListItem dense>
          <ListItemText
            primary="Build date"
            secondary={new Date(BUILD_DATE).toLocaleString()}
          />
        </ListItem>
      </List>
    </MenuDrawer>
  );
};
