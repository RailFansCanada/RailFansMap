import { State } from "./state";
import {
  setDrawerOpen,
  setShow3DBuildings,
  setAppTheme,
  setMapStyle,
  setShowLine,
  setUseAccessibleLabels,
  setTargetZoom,
  zoomIn,
  zoomOut,
  enableAlternative,
  disableAlternative,
  setShareSheetOpen,
} from "./actions";
import { createReducer } from "@reduxjs/toolkit";

export const initialState: State = {
  drawerOpen: false,
  shareSheetOpen: false,
  show3DBuildings: false,
  accessibleLabels: false,
  appTheme: "system",
  mapStyle: "vector",
  lines: {
    confederationLine: true,
    trilliumLine: true,
    kanataExtension: false,
    barrhavenExtension: false,
  },
  targetZoom: 11,
  barrhavenAlternatives: ["1"],
};

export const reducer = createReducer<State>(initialState, (builder) => {
  builder
    .addCase(setDrawerOpen, (state, action) => {
      state.drawerOpen = action.payload;
    })
    .addCase(setShareSheetOpen, (state, action) => {
      state.shareSheetOpen = action.payload;
    })
    .addCase(setShow3DBuildings, (state, action) => {
      state.show3DBuildings = action.payload;
    })
    .addCase(setUseAccessibleLabels, (state, action) => {
      state.accessibleLabels = action.payload;
    })
    .addCase(setAppTheme, (state, action) => {
      state.appTheme = action.payload;
    })
    .addCase(setMapStyle, (state, action) => {
      state.mapStyle = action.payload;
    })
    .addCase(setShowLine, (state, action) => {
      const [key, value] = action.payload;
      state.lines[key] = value;
    })

    .addCase(setTargetZoom, (state, action) => {
      state.targetZoom = action.payload;
    })
    .addCase(zoomIn, (state) => {
      state.targetZoom += 0.5;
      if (state.targetZoom > 20) {
        state.targetZoom = 20;
      }
    })
    .addCase(zoomOut, (state) => {
      state.targetZoom -= 0.5;
      if (state.targetZoom < 0) {
        state.targetZoom = 0;
      }
    })
    .addCase(enableAlternative, (state, action) => {
      state.barrhavenAlternatives.push(action.payload);
    })
    .addCase(disableAlternative, (state, action) => {
      state.barrhavenAlternatives = state.barrhavenAlternatives.filter(
        (value) => value !== action.payload
      );
    });
});
