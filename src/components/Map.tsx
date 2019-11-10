import * as React from "react";
import ReactMapGL, {
  ViewState,
  MapboxProps,
  ViewportProps,
  FlyToInterpolator,
  LinearInterpolator
} from "react-map-gl";
import { AutoSizer } from "react-virtualized";
import { Line } from "./Line";
import * as stage1 from "../../data/stage1.json";
import * as stage2south from "../../data/stage2south.json";
import * as stage2east from "../../data/stage2east.json";
import * as stage2west from "../../data/stage2west.json";
import * as stage3kanata from "../../data/stage3kanata.json";
import * as stage3barrhaven from "../../data/stage3barrhaven.json";
import { GeoJSON } from "geojson";

import _ from "../images/station.png";

export class Map extends React.Component<{}, { viewport: ViewState }> {
  readonly state = {
    viewport: {
      longitude: -75.6294,
      latitude: 45.3745,
      zoom: 11,
      bearing: -30
    }
  };

  private mapComponent: React.RefObject<ReactMapGL>;

  constructor(props: {}) {
    super(props);

    this.mapComponent = React.createRef();
  }

  componentDidMount() {
    let map = this.mapComponent.current.getMap();
    map.loadImage("./images/station.png", (error: any, value: any) => {
      map.addImage("station", value);
    });
  }

  _onViewportChange = (viewport: ViewportProps) => this.setState({ viewport });

  // _renderStationMarker = (station:, index) => {
  //   return (
  //     <Marker key={`station-${station}`}
  //   )
  // }

  render() {
    const { viewport } = this.state;
    return (
      <AutoSizer>
        {({ width, height }) => (
          <ReactMapGL
            ref={this.mapComponent}
            {...viewport}
            width={width}
            height={height}
            mapboxApiAccessToken="pk.eyJ1IjoiZGVsbGlzZCIsImEiOiJjazBqaXVveXEwN3k3M25tcjRzZHJkZmUzIn0.m0p9C09Vm2V-YVtQEgSQtg"
            onViewportChange={this._onViewportChange}
            mapOptions={{
              hash: true,
              customAttribution: ["Data: City of Ottawa"]
            }}
          >
            <Line data={stage1 as GeoJSON} name="stage1" />
            <Line data={stage2south as GeoJSON} name="stage2south" />
            <Line data={stage2east as GeoJSON} name="stage2east" />
            <Line data={stage2west as GeoJSON} name="stage2west" />
            <Line data={stage3kanata as GeoJSON} name="stage3kanata" />
            <Line data={stage3barrhaven as GeoJSON} name="stage3barrhaven" />
          </ReactMapGL>
        )}
      </AutoSizer>
    );
  }
}
