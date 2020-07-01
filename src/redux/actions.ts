import { createAction } from "@reduxjs/toolkit";
import { AppTheme, MapStyle, LineState } from "./state";
import { LinearScaleTwoTone } from "@material-ui/icons";

export const setDrawerOpen = createAction<boolean>("setDrawerOpen");

export const setShow3DBuildings = createAction<boolean>("setShow3DBuildings");

export const setUseAccessibleLabels = createAction<boolean>(
  "setUseAccessibleLabels"
);

export const setAppTheme = createAction<AppTheme>("setAppTheme");

export const setMapStyle = createAction<MapStyle>("setMapStyle");

export const setShowLine = createAction<[keyof LineState, boolean]>(
  "setShowLine"
);
