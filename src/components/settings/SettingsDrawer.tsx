import React from "react";
import {
  Drawer,
  AppBar,
  makeStyles,
  Theme,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  List,
} from "@material-ui/core";
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
} from "../../redux";
import { connect } from "react-redux";
import { Close } from "@material-ui/icons";
import { LayerOption } from "./LayerOption";
import { SwitchOption, MenuOption } from "./ListOptions";

import Scrollbars from "react-custom-scrollbars";

import confederationLine from "../../images/confederation.svg";
import trilliumLine from "../../images/trillium.svg";
import { useIsDarkTheme } from "../../app/utils";

interface SettingsDrawerProps {
  readonly open: boolean;
  readonly setDrawerOpen: typeof setDrawerOpen;

  readonly show3DBuildings: boolean;
  readonly setShow3DBuildings: typeof setShow3DBuildings;

  readonly accessibleLabels: boolean;
  readonly setUseAccessibleLabels: typeof setUseAccessibleLabels;

  readonly appTheme: AppTheme;
  readonly setAppTheme: typeof setAppTheme;

  readonly mapStyle: MapStyle;
  readonly setMapStyle: typeof setMapStyle;

  readonly lines: LineState;
  readonly setShowLine: typeof setShowLine;
}

const useStyles = makeStyles((theme: Theme) => ({
  drawerPaper: {
    width: 420,
    [theme.breakpoints.down("sm")]: {
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
    padding: theme.spacing(1, 0),
  },
  appBar: {
    backgroundColor: theme.palette.background.paper,
  },
  sectionHeader: {
    width: "100%",
    padding: theme.spacing(1, 2),
    margin: theme.spacing(1, 0),
    backgroundColor: theme.palette.background.default,
    boxSizing: "border-box",
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

const SettingsDrawerComponent = (props: SettingsDrawerProps) => {
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

  const isDarkTheme = useIsDarkTheme(props.appTheme);
  const blue = isDarkTheme ? "#8142fd" : "#5202F1";

  return (
    <Drawer
      classes={{ paper: classes.drawerPaper }}
      variant="persistent"
      anchor="right"
      open={props.open}
      elevation={4}
    >
      <Scrollbars>
        <AppBar className={classes.appBar} position="static" elevation={0}>
          <Toolbar>
            <IconButton
              className={classes.closeButton}
              edge="start"
              onClick={() => {
                props.setDrawerOpen(false);
              }}
            >
              <Close />
            </IconButton>
            <Typography className={classes.title} variant="h6">
              Map Settings
            </Typography>
          </Toolbar>
        </AppBar>
        <div className={classes.layerCardContainer}>
          <Typography className={classes.sectionHeader} variant="h6">
            O-Train Lines
          </Typography>

          <LayerOption
            primary="Confederation Line"
            secondary="Stages 1 and 2 of the Confederation Line, including Belfast and Moodie yards"
            selected={props.lines.confederationLine}
            onClick={() =>
              props.setShowLine([
                "confederationLine",
                !props.lines.confederationLine,
              ])
            }
            imageUrl={confederationLine}
            tint="#D62937"
          />

          <LayerOption
            primary="Trillium Line"
            secondary="The Trillium Line following the Stage 2 upgrades, including the new Walkley Yard"
            selected={props.lines.trilliumLine}
            onClick={() =>
              props.setShowLine(["trilliumLine", !props.lines.trilliumLine])
            }
            imageUrl={trilliumLine}
            tint="#76BE43"
          />

          <LayerOption
            primary="Kanata Extension"
            secondary="The proposed extension of the Confederation Line into Kanata"
            selected={props.lines.kanataExtension}
            onClick={() =>
              props.setShowLine([
                "kanataExtension",
                !props.lines.kanataExtension,
              ])
            }
            imageUrl={confederationLine}
            tint={blue}
          />

          <LayerOption
            primary="Barrhaven Extension"
            secondary="The proposed alignments and stations of the Confederation Line extension to Barrhaven"
            selected={props.lines.barrhavenExtension}
            onClick={() =>
              props.setShowLine([
                "barrhavenExtension",
                !props.lines.barrhavenExtension,
              ])
            }
            imageUrl={confederationLine}
            tint={blue}
          />

          <Typography className={classes.sectionHeader} variant="h6">
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
          <Typography className={classes.sectionHeader} variant="h6">
            Other Settings
          </Typography>

          <List>
            <SwitchOption
              primary="Show 3D buildings"
              checked={props.show3DBuildings}
              onToggle={(checked) => props.setShow3DBuildings(checked)}
            />
            <SwitchOption
              primary="Show High Contrast Labels"
              checked={props.accessibleLabels}
              onToggle={(checked) => props.setUseAccessibleLabels(checked)}
            />
            <MenuOption
              primary="Choose Theme"
              options={themeSettings}
              value={appThemeToIndex(props.appTheme)}
              onChange={handleThemeChange}
            />
          </List>
        </div>
      </Scrollbars>
    </Drawer>
  );
};

const mapStateToProps = (state: State) => ({
  open: state.drawerOpen,
  show3DBuildings: state.show3DBuildings,
  accessibleLabels: state.accessibleLabels,
  appTheme: state.appTheme,
  mapStyle: state.mapStyle,
  lines: state.lines,
});

const mapDispatchToProps = {
  setDrawerOpen,
  setShow3DBuildings,
  setUseAccessibleLabels,
  setAppTheme,
  setMapStyle,
  setShowLine,
};

export const SettingsDrawer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsDrawerComponent);
