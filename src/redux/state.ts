export type AppTheme = "system" | "light" | "dark";

export type MapStyle = "vector" | "satellite";

export interface State {
  readonly drawerOpen: boolean;

  readonly show3DBuildings: boolean;
  readonly appTheme: AppTheme;
  readonly mapStyle: MapStyle;
}
