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
import styled from "styled-components";

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
      <SectionHeader variant="overline">Basemap</SectionHeader>
      <LayerOption
        primary="Vector Basemap"
        secondary="Basic vector basemap in either light or dark themes"
        selected={mapStyle === "vector"}
        onClick={() => setMapStyle("vector")}
      />
      <LayerOption
        primary="Satellite Basemap"
        secondary="Satellite imagery"
        selected={mapStyle === "satellite"}
        onClick={() => setMapStyle("satellite")}
      />
      <Divider />

      <SectionHeader variant="overline">Other Settings</SectionHeader>

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
          primary="Choose Theme"
          options={themeSettings}
          value={appThemeToIndex(appTheme)}
          onChange={handleThemeChange}
        />
      </List>

      <Divider />
      <SectionHeader variant="overline">About</SectionHeader>
      <List>
        <ListItemButton href="https://www.iubenda.com/privacy-policy/15954265">
          <ListItemText primary="Privacy Policy" />
        </ListItemButton>
        <ListItem dense>
          <ListItemText primary="Version" secondary={VERSION} />
        </ListItem>
        <ListItem dense>
          <ListItemText
            primary="Built at"
            secondary={new Date(BUILD_DATE).toLocaleString()}
          />
        </ListItem>
      </List>
    </MenuDrawer>
  );
};
