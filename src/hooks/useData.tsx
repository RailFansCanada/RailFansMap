import React, { useContext, useEffect, useState } from "react";
import { Agency, config, Metadata, Region } from "../config";
import type { MapData } from "../config";
import { BBox, FeatureCollection, Geometry } from "geojson";
import { prepDatabase, processBounds, processFeatures } from "../app/search";
import { Database } from "sql.js";

export type LoadedMapData = FeatureCollection<Geometry> & {
  metadata: LoadedMetadata;
};

export type LoadedMetadata = Metadata & {
  region: string;
  agency: string;
  bbox: BBox;
};

export type Data = {
  features: FeatureCollection;
  lines: { [key: string]: LoadedMetadata };
  agencies: { [key: string]: Agency };
  regions: { [key: string]: Region };
  db: Database;
};

const loadData = async (fileName: string): Promise<MapData> => {
  const result = await fetch(`data/${fileName}`);
  if (!result.ok) {
    throw `Could not load ${fileName}`;
  }

  const json = await result.json();
  return json as MapData;
};

const mapFeatures = (
  region: Region,
  agency: Agency,
  data: MapData
): LoadedMapData => {
  const features = data.features.map((feature) => {
    feature.properties = {
      ...feature.properties,
      region: region.id,
      agency: agency.id,
      filterKey: data.metadata.filterKey,
      parent: data.metadata.id,
      class: data.metadata.type,
      color: data.metadata.color,
      offset: data.metadata.offset,
    };
    return feature;
  });

  const metadata = {
    ...data.metadata,
    agency: agency.id,
    region: region.id,
    bbox: data.bbox,
  };

  return { ...data, metadata, features };
};

const loadDataFromConfig = async (): Promise<LoadedMapData[]> => {
  const promises = config.regions.flatMap((region) => {
    return region.agencies.flatMap((agencyId) => {
      const agency = config.agencies.find((a) => a.id === agencyId);
      if (agency == null) throw `Agency wasn't found: ${agencyId}`;

      return agency.data.map((path) =>
        loadData(path).then((loaded) => mapFeatures(region, agency, loaded))
      );
    });
  });

  return await Promise.all(promises);
};

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
    features: null,
    db: null,
    agencies: agenciesDict,
    regions: regionsDict,
    lines: {},
  });

  useEffect(() => {
    (async () => {
      const db = await prepDatabase();
      const data = await loadDataFromConfig();

      const collection: FeatureCollection = {
        type: "FeatureCollection",
        features: data.flatMap((d) => d.features),
      };
      const linesDict: { [key: string]: LoadedMetadata } = {};
      data.forEach((d) => {
        linesDict[d.metadata.id] = d.metadata;
      });

      await processFeatures(db, collection, cache.agencies, cache.regions);
      await processBounds(
        db,
        Object.values(linesDict),
        cache.agencies,
        cache.regions
      );

      setCache((cache) => ({
        ...cache,
        features: collection,
        lines: linesDict,
        db,
      }));
    })();
  }, []);

  return cache;
};

const DataContext2 = React.createContext<Data>({
  features: null,
  agencies: {},
  regions: {},
  lines: {},
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
