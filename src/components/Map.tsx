import * as React from "react";
import ReactMapGL, {
  ViewState,
  MapboxProps,
  ViewportProps
} from "react-map-gl";
import { AutoSizer } from "react-virtualized";

export class Map extends React.Component<{}, { viewport: ViewState }> {
  readonly state = {
    viewport: {
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 8
    }
  };

  _onViewportChange = (viewport: ViewportProps) => this.setState({ viewport });

  render() {
    const { viewport } = this.state;
    return (
      <AutoSizer>
        {({ width, height }) => (
          <ReactMapGL
            {...viewport}
            width={width}
            height={height}
            mapboxApiAccessToken="pk.eyJ1IjoiZGVsbGlzZCIsImEiOiJjazBqaXVveXEwN3k3M25tcjRzZHJkZmUzIn0.m0p9C09Vm2V-YVtQEgSQtg"
            onViewportChange={this._onViewportChange}
          />
        )}
      </AutoSizer>
    );
  }
}
