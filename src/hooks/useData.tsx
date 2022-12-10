import React, { useContext, useEffect, useState } from "react";
import { Agency, config, Metadata, Region } from "../config";
import { BBox, FeatureCollection, Geometry } from "geojson";
import { prepDatabase, processBounds, processFeatures } from "../app/search";
import { Database } from "sql.js";
import lineMetadata from "../../build/metadata.json";

export type LoadedMapData = FeatureCollection<Geometry> & {
  metadata: LoadedMetadata;
};

export type LoadedMetadata = Metadata & {
  region: string;
  agency: string;
  bbox: BBox;
};

export type Data = {
  lines: { [key: string]: LoadedMetadata };
  agencies: { [key: string]: Agency };
  regions: { [key: string]: Region };
  db: Database;
};

const metadata = lineMetadata as unknown as { [key: string]: LoadedMetadata };

const useProvideData2 = (): Data => {
  // Map agency and region arrays to an object dictionary
  const agenciesDict: { [key: string]: Agency } = {};
  config.agencies.forEach((agency) => {
    agenciesDict[agency.id] = agency;
  });

  const regionsDict: { [key: string]: Region } = {};
  config.regions.forEach((region) => {
    regionsDict[region.id] = region;
  });

  const [cache, setCache] = useState<Data>({
    db: null,
    agencies: agenciesDict,
    regions: regionsDict,
    lines: metadata,
  });

  useEffect(() => {
    (async () => {
      const db = await prepDatabase();
      const data = await fetch("search.json").then(result => result.json());

      await processFeatures(db, data.stations);
      await processBounds(db, data.bounds);

      setCache((cache) => ({
        ...cache,
        db,
      }));
    })();
  }, []);

  return cache;
};

const DataContext2 = React.createContext<Data>({
  agencies: {},
  regions: {},
  lines: metadata,
  db: null,
});

export const ProvideData2 = (props: { children: React.ReactNode }) => {
  const cache = useProvideData2();

  return (
    <DataContext2.Provider value={cache}>
      {props.children}
    </DataContext2.Provider>
  );
};

export const useData2 = () => useContext(DataContext2);
