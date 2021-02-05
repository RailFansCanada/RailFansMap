export type AppTheme = "system" | "light" | "dark";

export type MapStyle = "vector" | "satellite";

export type Alternatives = "1" | "2" | "3" | "A" | "4" | "5" | "6";

export interface State {
  readonly drawerOpen: boolean;
  readonly shareSheetOpen: boolean;

  readonly show3DBuildings: boolean;
  readonly accessibleLabels: boolean;
  readonly appTheme: AppTheme;
  readonly mapStyle: MapStyle;

  readonly lines: LineState;

  readonly targetZoom: number;
  readonly zoom: number;

  readonly barrhavenAlternatives: Alternatives[];
}

export interface LineState {
  readonly confederationLine: boolean;
  readonly trilliumLine: boolean;
  readonly kanataExtension: boolean;
  readonly barrhavenExtension: boolean;
  readonly [key: string]: boolean;
}
