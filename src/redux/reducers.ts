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
  setZoom,
  setShowLineLabels,
} from "./actions";
import { createReducer } from "@reduxjs/toolkit";
import { setLegendDrawerOpen } from ".";

export const initialState: State = {
  drawerOpen: false,
  legendDrawerOpen: false,
  shareSheetOpen: false,
  show3DBuildings: false,
  accessibleLabels: false,
  appTheme: "system",
  mapStyle: "vector",
  showSatelliteLabels: true,
  showLineLabels: true,
  lines: {
    confederationLine: true,
    trilliumLine: true,
    kanataExtension: false,
    barrhavenExtension: false,
    gatineauLrt: false,
  },
  targetZoom: 11,
  zoom: 11,
  alternatives: {
    "gatineauLrt": ["1"]
  },
};

export const reducer = createReducer<State>(initialState, (builder) => {
  builder
    .addCase(setDrawerOpen, (state, action) => {
      state.drawerOpen = action.payload;
    })
    .addCase(setLegendDrawerOpen, (state, action) => {
      state.legendDrawerOpen = action.payload;
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
    .addCase(setZoom, (state, action) => {
      state.zoom = action.payload;
    })
    .addCase(zoomIn, (state) => {
      state.targetZoom = state.zoom + 0.5;
      if (state.targetZoom > 20) {
        state.targetZoom = 20;
      }
    })
    .addCase(zoomOut, (state) => {
      state.targetZoom = state.zoom - 0.5;
      if (state.targetZoom < 0) {
        state.targetZoom = 0;
      }
    })
    .addCase(enableAlternative, (state, action) => {
      const [key, value] = action.payload;
      if (state.alternatives[key] == null) {
        state.alternatives[key] = [];
      }
      state.alternatives[key].push(value);
    })
    .addCase(disableAlternative, (state, action) => {
      const [key, value] = action.payload;
      state.alternatives[key] = state.alternatives[key]?.filter(
        (v) => v !== value
      );
    })
    .addCase(setShowLineLabels, (state, action) => {
      state.showLineLabels = action.payload;
    });
});
