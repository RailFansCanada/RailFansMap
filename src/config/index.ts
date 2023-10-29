import type { BBox, FeatureCollection, Geometry, Position } from "geojson";
import configJson from "../config.json";

export const config = configJson as unknown as Config;

/**
 * Metadata that can be defined for a set of data that can be loaded into the map
 */
export type Metadata = {
  type: "rail-line" | "rail-yard" | "streetcar-line" | "streetcar-yard";
  color?: string;
  offset?: number;
  id: string;
  icon?: string;
  source: string[];
  sources: string[];
  name: string;
  description: string;
  notes?: string;
  filterKey?: string;
  searchTerms?: string[];
};

/**
 * MapData, as defined in GeoJSON files.
 * These files contain a GeoJSON FeatureCollection with an additional `metadata` prop with custom metadata.
 *
 */
export type MapData = FeatureCollection<Geometry> & { metadata: Metadata };

/**
 * Definition for a transit agency. Definitions are placed into cities.json.
 */
export type Agency = {
  id: string;
  name: string;
  bbox: BBox;
  data: string[];
};

/**
 * Definition for a region. Used for display labels on the map at the specified location.
 */
export type Region = {
  id: string;
  title: string;
  location: Position;
  bbox: BBox;
  agencies: string[];
  tier: number;
};

export interface Config {
  readonly agencies: Agency[];
  readonly regions: Region[];
}
