import { createAction } from "@reduxjs/toolkit";
import { AppTheme, MapStyle } from "./state";

export const setDrawerOpen = createAction<boolean>("setDrawerOpen");

export const setShow3DBuildings = createAction<boolean>("setShow3DBuildings");

export const setAppTheme = createAction<AppTheme>("setAppTheme");

export const setMapStyle = createAction<MapStyle>("setMapStyle");
