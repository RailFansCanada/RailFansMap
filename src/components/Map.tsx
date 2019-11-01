import * as React from "react";
import ReactMapGL, { ViewState, MapboxProps } from 'react-map-gl';

export class Map extends React.Component<MapboxProps, { viewport: ViewState }> {
    readonly state = {
        viewport: {
            width: 400,
            height: 400,
            latitude: 37.7577,
            longitude: -122.4376,
            zoom: 8
        }
    }
    render() {
        return <ReactMapGL {...this.state.viewport} onViewportChange={(viewport) => this.setState({ viewport })} />
    }
}