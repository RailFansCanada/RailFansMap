import type { BBox, FeatureCollection, Geometry, Position } from "geojson";
import configJson from "./config.json";

export const config = configJson as unknown as Config;

/**
 * Metadata that can be defined for a set of data that can be loaded into the map
 */
export interface Metadata {
  type: "rail-line" | "rail-yard";
  color?: string;
  filterKey?: string;
  offset?: number;
  id: string;
  icon?: string;
  source: string[];
}

/**
 * MapData, as defined in GeoJSON files.
 * These files contain a GeoJSON FeatureCollection with an additional `metadata` prop with custom metadata.
 *
 */
export type MapData = FeatureCollection<Geometry> & { metadata: Metadata };

/**
 * Definition for a transit agency. Definitions are placed into cities.json.
 */
export interface Agency {
  readonly name: string;
  readonly bbox: BBox;
  readonly data: string[];
}

/**
 * Definition for a region. Used for display labels on the map at the specified location.
 */
export interface Region {
  readonly title: string;
  readonly location: Position;
}

export interface Config {
  readonly agencies: { [key: string]: Agency };
  readonly regions: { [key: string]: Region };
}
