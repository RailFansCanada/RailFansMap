import { State } from "./state";
import {
  setDrawerOpen,
  setShow3DBuildings,
  setAppTheme,
  setMapStyle,
  setShowLine,
} from "./actions";
import { createReducer } from "@reduxjs/toolkit";

const initialState: State = {
  drawerOpen: false,
  show3DBuildings: false,
  appTheme: "system",
  mapStyle: "vector",
  lines: {
    confederationLine: true,
    trilliumLine: true,
    kanataExtension: false,
    barrhavenExtension: false,
  },
};

export const reducer = createReducer<State>(initialState, (builder) => {
  builder
    .addCase(setDrawerOpen, (state, action) => {
      state.drawerOpen = action.payload;
    })
    .addCase(setShow3DBuildings, (state, action) => {
      state.show3DBuildings = action.payload;
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
    });
});
