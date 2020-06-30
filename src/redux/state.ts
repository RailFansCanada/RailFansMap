export type AppTheme = "system" | "light" | "dark";

export type MapStyle = "vector" | "satellite";

export interface State {
  readonly drawerOpen: boolean;

  readonly show3DBuildings: boolean;
  readonly appTheme: AppTheme;
  readonly mapStyle: MapStyle;

  readonly lines: LineState;
}

export interface LineState {
  readonly confederationLine: boolean;
  readonly trilliumLine: boolean;
  readonly kanataExtension: boolean;
  readonly barrhavenExtension: boolean;
}
