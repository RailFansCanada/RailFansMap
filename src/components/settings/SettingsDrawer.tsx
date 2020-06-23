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
} from "../../redux";
import { connect } from "react-redux";
import { Close } from "@material-ui/icons";
import { LayerOption } from "./LayerOption";
import { SwitchOption, MenuOption } from "./ListOptions";

interface SettingsDrawerProps {
  readonly open: boolean;
  readonly setDrawerOpen: typeof setDrawerOpen;

  readonly show3DBuildings: boolean;
  readonly setShow3DBuildings: typeof setShow3DBuildings;

  readonly appTheme: AppTheme;
  readonly setAppTheme: typeof setAppTheme;

  readonly mapStyle: MapStyle;
  readonly setMapStyle: typeof setMapStyle;
}

const useStyles = makeStyles((theme: Theme) => ({
  drawerPaper: {
    width: 380,
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

  return (
    <Drawer
      classes={{ paper: classes.drawerPaper }}
      variant="persistent"
      anchor="right"
      open={props.open}
      elevation={4}
    >
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
          <MenuOption
            primary="Choose Theme"
            options={themeSettings}
            value={appThemeToIndex(props.appTheme)}
            onChange={handleThemeChange}
          />
        </List>
      </div>
    </Drawer>
  );
};

const mapStateToProps = (state: State) => ({
  open: state.drawerOpen,
  show3DBuildings: state.show3DBuildings,
  appTheme: state.appTheme,
  mapStyle: state.mapStyle,
});

const mapDispatchToProps = {
  setDrawerOpen,
  setShow3DBuildings,
  setAppTheme,
  setMapStyle,
};

export const SettingsDrawer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsDrawerComponent);
