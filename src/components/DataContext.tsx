import React from "react";
import { FeatureCollection, Geometry } from "geojson";

export interface Metadata {
  type: "rail-line" | "rail-yard";
  color?: string;
  filterKey?: string;
}

export interface WithMetadata {
  metadata: Metadata;
}

export type MapData = FeatureCollection<Geometry> & WithMetadata;

export interface MapDataCache {
  [key: string]: MapData;
}

export const DataContext = React.createContext<MapDataCache>({});
