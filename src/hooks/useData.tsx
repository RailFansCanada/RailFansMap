import React, { useContext } from "react";
import { Agency, config } from "../config";
import type { MapData } from "../config";
import produce from "immer";
import { BBox, Point } from "geojson";

import booleanContains from "@turf/boolean-contains";
import booleanOverlap from "@turf/boolean-overlap";
import bboxPolygon from "@turf/bbox-polygon";
import { insertStations, prepDatabase } from "../app/search";
import { Database } from "sql.js";

export type Dataset = { [key: string]: MapData };
export interface DataCache {
  data: Dataset;
  agencies: Agency[];
  visible: Agency[];
  updateBbox(bbox: BBox): void;
  db: Database;
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
  const [currentBbox, setCurrentBbox] = React.useState<BBox>([0, 0, 0, 0]);

  const updateBbox = (bbox: BBox) => {
    setCurrentBbox(bbox);
  };

  const [cache, setCache] = React.useState<DataCache>({
    data: {},
    agencies: config.agencies,
    visible: [],
    updateBbox,
    db: null,
  });

  // Load in data
  React.useEffect(() => {
    async function init() {
      const db = await prepDatabase();

      config.agencies.forEach((value) => {
        value.data.forEach((name) => {
          loadData(name)
            .then((value) => {
              // Insert station details into database
              const stations = value.features
                .filter((f) => f.properties.type === "station-label")
                .map((f) => {
                  const point = f.geometry as Point;
                  return {
                    name: f.properties.name,
                    lines: f.properties.lines,
                    lng: point.coordinates[0],
                    lat: point.coordinates[1],
                    description: "",
                  };
                });
              insertStations(db, stations);

              setCache((cache) => {
                return produce(cache, (draft) => {
                  draft.data[name] = value;
                });
              });
            })
            .catch((reason) => console.error(reason));
        });
      });

      setCache((cache) => ({ ...cache, db }));
    }

    init();
  }, []);

  // Find all agencies that are contained in the current bbox, i.e. visible on screen
  React.useEffect(() => {
    const visibilityBbox = bboxPolygon(currentBbox);

    const visibleAgencies = config.agencies.filter((agency) => {
      const agencyBbox = bboxPolygon(agency.bbox);
      return (
        booleanOverlap(visibilityBbox, agencyBbox) ||
        booleanContains(agencyBbox, visibilityBbox) ||
        booleanContains(visibilityBbox, agencyBbox)
      );
    });

    setCache((cache) => {
      return produce(cache, (draft) => {
        draft.visible = visibleAgencies;
      });
    });
  }, [currentBbox]);

  return cache;
};

const DataContext = React.createContext<DataCache>({
  data: {},
  agencies: config.agencies,
  visible: [],
  updateBbox: () => {},
  db: null,
});

export const ProvideData = (props: { children: React.ReactNode }) => {
  const cache = useProvideData();

  return (
    <DataContext.Provider value={cache}>{props.children}</DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
