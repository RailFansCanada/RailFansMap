export type AppTheme = "system" | "light" | "dark";

export type MapStyle = "vector" | "satellite";

// Maps a toggle key to an array of alternative IDs
export type Alternatives = { [key: string]: string[] }

export interface State {
  readonly drawerOpen: boolean;
  readonly shareSheetOpen: boolean;

  readonly show3DBuildings: boolean;
  readonly accessibleLabels: boolean;
  readonly appTheme: AppTheme;
  readonly mapStyle: MapStyle;
  
  readonly showSatelliteLabels: boolean;
  readonly showLineLabels: boolean;

  readonly lines: LineState;

  readonly targetZoom: number;
  readonly zoom: number;

  readonly alternatives: Alternatives;
}

export interface LineState {
  readonly confederationLine: boolean;
  readonly trilliumLine: boolean;
  readonly kanataExtension: boolean;
  readonly barrhavenExtension: boolean;
  readonly gatineauLrt: boolean;
  readonly [key: string]: boolean;
}
