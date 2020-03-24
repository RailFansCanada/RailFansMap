import * as React from "react";
import ReactMapGL, {
  ViewState,
  LinearInterpolator,
  Layer,
  Source
} from "react-map-gl";
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

import _ from "../images/station.png";

export interface OverviewMapProps {
  initialViewState?: ViewState | null;
}

export const OverviewMap = (props: OverviewMapProps) => {
  const [viewport, setViewport] = React.useState<ViewState>(
    props.initialViewState ?? {
      longitude: -75.6701,
      latitude: 45.3599,
      zoom: 11,
      bearing: -30
    }
  );

  const mapRef = React.useRef<ReactMapGL>();

  React.useEffect(() => {
    const map = mapRef.current.getMap();

    map.loadImage("./images/station.png", (error: any, value: any) => {
      map.addImage("station", value);
    });
  }, []);

  return (
    <AutoSizer>
      {({ width, height }) => (
        <ReactMapGL
          mapStyle="mapbox://styles/mapbox/light-v10"
          ref={mapRef}
          {...viewport}
          width={width}
          height={height}
          mapboxApiAccessToken="pk.eyJ1IjoiZGVsbGlzZCIsImEiOiJjazBqaXVveXEwN3k3M25tcjRzZHJkZmUzIn0.m0p9C09Vm2V-YVtQEgSQtg"
          onViewportChange={setViewport}
          mapOptions={{
            hash: true,
            customAttribution: ["Data: City of Ottawa"]
          }}
          transitionDuration={0}
          transitionInterpolator={new LinearInterpolator()}
          transitionEasing={easeCubicOut}
        >
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
