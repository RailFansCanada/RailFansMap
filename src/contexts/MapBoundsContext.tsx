import { LngLatBounds } from "mapbox-gl";
import { config, Region } from "../config";
import bboxPolygon from "@turf/bbox-polygon";
import { BBox } from "geojson";
import booleanIntersects from "@turf/boolean-intersects";
import React, { createContext, ReactNode, useEffect, useState } from "react";

export type MapBoundsContent = {
  tier1: Region[];
  tier2: Region[];
  tier3: Region[];
};

const timeout = 250;
let lock = false;
let next: LngLatBounds | null = null;

let reactListener: ((content: MapBoundsContent) => void) | null = null;

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

  const tier1: Region[] = [];
  const tier2: Region[] = [];
  const tier3: Region[] = [];

  for (let region of overlapping) {
    if (region.tier === 1) {
      tier1.push(region);
    } else if (region.tier === 2) {
      tier2.push(region);
    } else if (region.tier === 3) {
      tier3.push(region);
    }
  }

  reactListener?.({ tier1, tier2, tier3 });
}

const initialContent: MapBoundsContent = {
  tier1: [],
  tier2: [],
  tier3: [],
};

export const MapBoundsContext = createContext<MapBoundsContent>(initialContent);

export const MapBoundsProvider = (props: { children: ReactNode }) => {
  const [state, setState] = useState<MapBoundsContent>(initialContent);
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
