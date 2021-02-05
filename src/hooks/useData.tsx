import React, { useContext } from "react";
import { FeatureCollection, Geometry } from "geojson";
import { cities } from "../app/cities";

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

const loadData = async (fileName: string): Promise<MapData> => {
  const result = await fetch(`data/${fileName}`);
  if (!result.ok) {
    throw `Could not load ${fileName}`;
  }

  const json = await result.json();
  return json as MapData;
};

const useProvideData = (): MapDataCache => {
  const [cache, setCache] = React.useState<MapDataCache>({});

  // Load in data
  React.useEffect(() => {
    Object.entries(cities).forEach(([_, value]) => {
      value.data.forEach((name) => {
        loadData(name)
          .then((value) => setCache((cache) => ({ ...cache, [name]: value })))
          .catch((reason) => console.error(reason));
      });
    });
  }, []);

  return cache;
};

const DataContext = React.createContext<MapDataCache>({});

export const ProvideData = (props: { children: React.ReactNode }) => {
  const cache = useProvideData();

  return (
    <DataContext.Provider value={cache}>{props.children}</DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
