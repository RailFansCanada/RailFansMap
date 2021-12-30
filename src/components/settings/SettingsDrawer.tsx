import React from "react";
import { Theme, Typography, List, Divider } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {
  State,
  setDrawerOpen,
  setShow3DBuildings,
  AppTheme,
  setAppTheme,
  MapStyle,
  setMapStyle,
  LineState,
  setShowLine,
  setUseAccessibleLabels,
  setShowLineLabels,
  setShowSatelliteLabels,
} from "../../redux";
import { connect } from "react-redux";
import { LayerOption } from "./LayerOption";
import { SwitchOption, MenuOption } from "./ListOptions";

import { MenuDrawer } from "./MenuDrawer";

interface SettingsDrawerProps {
  open: boolean;
  setDrawerOpen: typeof setDrawerOpen;

  show3DBuildings: boolean;
  setShow3DBuildings: typeof setShow3DBuildings;

  accessibleLabels: boolean;
  setUseAccessibleLabels: typeof setUseAccessibleLabels;

  appTheme: AppTheme;
  setAppTheme: typeof setAppTheme;

  mapStyle: MapStyle;
  setMapStyle: typeof setMapStyle;

  lines: LineState;
  setShowLine: typeof setShowLine;

  showLineLabels: boolean;
  setShowLineLabels: typeof setShowLineLabels;

  showSatelliteLabels: boolean;
  setShowSatelliteLabels: typeof setShowSatelliteLabels;
}

const useStyles = makeStyles((theme: Theme) => ({
  drawerPaper: {
    width: 420,
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
    boxShadow: theme.shadows[4],
  },
  closeButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: theme.palette.text.primary,
  },
  layerCardContainer: {
    display: "flex",
    flexGrow: 1,
    height: "100%",
  },
  appBar: {
    backgroundColor: theme.palette.background.default,
    display: "flex",
    flexGrow: 0,
  },
  sectionHeader: {
    width: "100%",
    padding: theme.spacing(0, 2),
    margin: theme.spacing(2, 0, 0, 0),
    boxSizing: "border-box",
    display: "block",
  },
}));

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

const SettingsDrawerComponent = (props: Readonly<SettingsDrawerProps>) => {
  const classes = useStyles();
  const handleThemeChange = (index: number) => {
    switch (index) {
      case 0: {
        props.setAppTheme("system");
        break;
      }
      case 1: {
        props.setAppTheme("light");
        break;
      }
      case 2: {
        props.setAppTheme("dark");
        break;
      }
    }
  };

  return (
    <MenuDrawer
      open={props.open}
      onClose={() => {
        props.setDrawerOpen(false);
      }}
      title="Map Settings"
    >
      <Typography className={classes.sectionHeader} variant="overline">
        Basemap
      </Typography>
      <LayerOption
        primary="Vector Basemap"
        secondary="Basic vector basemap in either light or dark themes"
        selected={props.mapStyle === "vector"}
        onClick={() => props.setMapStyle("vector")}
      />
      <LayerOption
        primary="Satellite Basemap"
        secondary="Satellite imagery"
        selected={props.mapStyle === "satellite"}
        onClick={() => props.setMapStyle("satellite")}
      />
      <Divider />

      <Typography className={classes.sectionHeader} variant="overline">
        Other Settings
      </Typography>

      <List>
        <SwitchOption
          primary="Show 3D buildings"
          checked={props.show3DBuildings}
          onToggle={(checked) => props.setShow3DBuildings(checked)}
        />
        {/* <SwitchOption
              primary="Show street names on Satellite view"
              checked={props.showSatelliteLabels}
              disabled={props.mapStyle != "satellite"}
              onToggle={(checked) => props.setShowSatelliteLabels(checked)}
            /> */}
        <SwitchOption
          primary="Show station labels"
          checked={props.showLineLabels}
          onToggle={(checked) => props.setShowLineLabels(checked)}
        />
        <MenuOption
          primary="Choose Theme"
          options={themeSettings}
          value={appThemeToIndex(props.appTheme)}
          onChange={handleThemeChange}
        />
      </List>
    </MenuDrawer>
  );
};

const mapStateToProps = (state: State) => ({
  open: state.drawerOpen,
  show3DBuildings: state.show3DBuildings,
  accessibleLabels: state.accessibleLabels,
  appTheme: state.appTheme,
  mapStyle: state.mapStyle,
  lines: state.lines,
  showLineLabels: state.showLineLabels,
  showSatelliteLabels: state.showSatelliteLabels,
});

const mapDispatchToProps = {
  setDrawerOpen,
  setShow3DBuildings,
  setUseAccessibleLabels,
  setAppTheme,
  setMapStyle,
  setShowLine,
  setShowLineLabels,
  setShowSatelliteLabels,
};

export const SettingsDrawer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsDrawerComponent);
