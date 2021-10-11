import React, { useContext } from "react";
import { config } from "../config";
import type { MapData } from "../config";

export interface DataCache {
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

const useProvideData = (): DataCache => {
  const [cache, setCache] = React.useState<DataCache>({});
  // Load in data
  React.useEffect(() => {
    Object.entries(config.agencies).forEach(([_, value]) => {
      value.data.forEach((name) => {
        loadData(name)
          .then((value) => setCache((cache) => ({ ...cache, [value.metadata.id]: value })))
          .catch((reason) => console.error(reason));
      });
    });
  }, []);

  return cache;
};

const DataContext = React.createContext<DataCache>({});

export const ProvideData = (props: { children: React.ReactNode }) => {
  const cache = useProvideData();

  return (
    <DataContext.Provider value={cache}>{props.children}</DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
