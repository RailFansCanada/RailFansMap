import React from "react";
import GeoJSON from "geojson";
import { Source, Layer } from "react-mapbox-gl";
import { AnyLayout } from "mapbox-gl";

export interface RailYardProps {
  position: [number, number];
  name: string;
  data: GeoJSON.FeatureCollection<GeoJSON.Geometry>;
}

export const RailYard = ({ position, name, data }: RailYardProps) => {
  const dataRef = React.useRef({
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        ...data.features,
        {
          type: "Feature",
          properties: { type: "yard-label" },
          geometry: {
            type: "Point",
            coordinates: position,
          },
        },
      ],
    },
  });
  return (
    <>
      <Source id={name} type="geojson" geoJsonSource={dataRef.current} />
      <Layer
        id={`${name}-tracks`}
        before="content-mask"
        type="line"
        sourceId={name}
        filter={["==", "type", "tracks"]}
        layout={{
          "line-join": "round",
          "line-cap": "round",
        }}
        paint={{
          "line-color": "#818181",
          "line-width": 3,
        }}
      />
      <Layer
        id={`${name}-labels`}
        beforeId="symbol-mask"
        type="symbol"
        sourceId={name}
        filter={["==", "type", "yard-label"]}
        minzoom={10}
        layout={
          {
            "text-field": name,
            "text-anchor": "center",
            "text-optional": true,
            "text-font": ["Raleway Bold"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              12,
              15,
              18,
              18,
              26,
            ],
          } as AnyLayout
        }
        paint={{
          "text-halo-width": 2,
          "text-halo-blur": 0,
          "text-color": "#212121",
          "text-halo-color": "#FFFFFF",
        }}
      />
    </>
  );
};
