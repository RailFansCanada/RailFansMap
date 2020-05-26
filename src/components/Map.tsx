import * as React from "react";
import ReactMapGL, {
  ViewState,
  LinearInterpolator,
  NavigationControl,
  Layer,
  Source,
  FlyToInterpolator,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AutoSizer } from "react-virtualized";
import { Line } from "./Line";
import * as stage1 from "../../data/stage1.json";
import * as stage2south from "../../data/stage2south.json";
import * as stage2east from "../../data/stage2east.json";
import * as stage2west from "../../data/stage2west.json";
import * as stage3kanata from "../../data/stage3kanata.json";
import * as stage3barrhaven from "../../data/stage3barrhaven.json";
import * as GeoJSON from "geojson";
import { easeCubicOut } from "d3-ease";

export interface OverviewMapProps {
  initialViewState?: ViewState | null;
}

export const OverviewMap = (props: OverviewMapProps) => {
  const [viewport, setViewport] = React.useState<ViewState>(
    props.initialViewState ?? {
      longitude: -75.6701,
      latitude: 45.3599,
      zoom: 11,
      bearing: -30,
    }
  );

  return (
    <AutoSizer>
      {({ width, height }) => (
        <ReactMapGL
          mapStyle="mapbox://styles/mapbox/light-v10"
          {...viewport}
          width={width}
          height={height}
          mapboxApiAccessToken="pk.eyJ1IjoiZGVsbGlzZCIsImEiOiJjazBqaXVveXEwN3k3M25tcjRzZHJkZmUzIn0.m0p9C09Vm2V-YVtQEgSQtg"
          onViewportChange={setViewport}
          mapOptions={{
            hash: true,
            customAttribution: ["Data: City of Ottawa"],
          }}
        >
          <div style={{ position: "absolute", right: 16, top: 16 }}>
            <NavigationControl />
          </div>
          {/* Layer z-ordering hack */}
          <Source
            id="blank"
            type="geojson"
            data={{ type: "FeatureCollection", features: [] }}
          >
            <Layer type="fill" id="content-mask" paint={{}} layout={{}} />
            <Layer type="fill" id="circle-mask" paint={{}} layout={{}} />
            <Layer type="fill" id="symbol-mask" paint={{}} layout={{}} />
          </Source>
          <Line
            data={
              stage3barrhaven as GeoJSON.FeatureCollection<GeoJSON.Geometry>
            }
            name="stage3barrhaven"
          />
          <Line
            data={stage2south as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
            name="stage2south"
          />
          <Line
            data={stage2east as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
            name="stage2east"
          />
          <Line
            data={stage2west as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
            name="stage2west"
          />
          <Line
            data={stage1 as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
            name="stage1"
          />
          <Line
            data={stage3kanata as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
            name="stage3kanata"
          />
        </ReactMapGL>
      )}
    </AutoSizer>
  );
};
