import { LngLatBounds } from "mapbox-gl";
import { config, Region } from "../config";
import bboxPolygon from "@turf/bbox-polygon";
import { BBox } from "geojson";
import booleanIntersects from "@turf/boolean-intersects";
import React, { createContext, ReactNode, useEffect, useState } from "react";

const timeout = 250;
let lock = false;
let next: LngLatBounds | null = null;

let reactListener: ((regions: Region[]) => void) | null = null;

export function postNewBounds(bounds: LngLatBounds) {
  next = bounds;
  if (lock) return;

  lock = true;
  setTimeout(() => {
    lock = false;

    computeOverlappingBounds(next);
  }, timeout);

  computeOverlappingBounds(bounds);
}

const regions = config.regions.map((region) => {
  return {
    region,
    bbox: bboxPolygon(region.bbox),
  };
});

function computeOverlappingBounds(bounds: LngLatBounds) {
  const bbox = bboxPolygon(bounds.toArray().flat() as BBox);
  const overlapping = regions
    .filter((r) => booleanIntersects(bbox, r.bbox))
    .map((r) => r.region);

  reactListener?.(overlapping);
}

export const MapBoundsContext = createContext<Region[]>([]);

export const MapBoundsProvider = (props: { children: ReactNode }) => {
  const [state, setState] = useState<Region[]>([]);
  useEffect(() => {
    reactListener = (regions) => {
      setState(regions);
    };
  }, []);

  return (
    <MapBoundsContext.Provider value={state}>
      {props.children}
    </MapBoundsContext.Provider>
  );
};
