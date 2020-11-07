import * as React from "react";

import ReactMapboxGl, { Source, Layer } from "react-mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { Line } from "./Line";
import { RailYard } from "./RailYard";

import { State, AppTheme, MapStyle, LineState, setTargetZoom } from "../redux";
import { connect } from "react-redux";
import { useIsDarkTheme } from "../app/utils";
import { DataContext } from "./DataContext"

export interface OverviewMapProps {
  readonly show3DBuildings: boolean;
  readonly appTheme: AppTheme;
  readonly mapStyle: MapStyle;
  readonly lines: LineState;
  readonly accessibleLabels: boolean;

  readonly targetZoom: number;
  readonly setTargetZoom: typeof setTargetZoom;
}

const Map = ReactMapboxGl({
  accessToken: MAPBOX_KEY,
  customAttribution: ["Data: City of Ottawa"],
  hash: true,
  antialias: true,
});

export const OverviewMapComponent = React.memo((props: OverviewMapProps) => {
  const [location, setLocation] = React.useState<[number, number]>([
    -75.6579,
    45.3629,
  ]);
  const [zoom, setZoom] = React.useState<[number]>([11]);
  const [bearing, setBearing] = React.useState<[number]>([-30]);

  const handleClick = (
    map: mapboxgl.Map,
    event: React.SyntheticEvent<any, Event> &
      mapboxgl.MapMouseEvent &
      mapboxgl.EventData
  ) => {
    const features = map.queryRenderedFeatures(event.point);
    for (let feature of features) {
      if (feature.properties.url != null && feature.properties.url !== "null") {
        window.parent.location.href = `https://www.railfans.ca/${feature.properties.url}`;
      }
    }
  };

  const handleMouseMove = (
    map: mapboxgl.Map,
    event: React.SyntheticEvent<any, Event> &
      mapboxgl.MapMouseEvent &
      mapboxgl.EventData
  ) => {
    let hovered = false;
    const features = map.queryRenderedFeatures(event.point);
    if (features.length > 0) {
      for (let feature of features) {
        if (feature.properties.type === "station-label") {
          map.getCanvas().style.cursor = "pointer";
          hovered = true;
          break;
        }
      }
    }

    if (!hovered) {
      map.getCanvas().style.cursor = "";
    }
  };

  const isDarkTheme = useIsDarkTheme(props.appTheme);

  const [style, setStyle] = React.useState(
    props.mapStyle === "satellite"
      ? "mapbox://styles/mapbox/satellite-streets-v11"
      : isDarkTheme
      ? "mapbox://styles/mapbox/dark-v10"
      : "mapbox://styles/mapbox/light-v10"
  );

  React.useEffect(() => {
    if (props.mapStyle === "satellite") {
      setStyle("mapbox://styles/mapbox/satellite-streets-v11");
    } else {
      setStyle(
        isDarkTheme
          ? "mapbox://styles/mapbox/dark-v10"
          : "mapbox://styles/mapbox/light-v10"
      );
    }
  }, [isDarkTheme, props.appTheme, props.mapStyle]);

  React.useEffect(() => {
    // Zoom input from +/- buttons
    setZoom([props.targetZoom]);
  }, [props.targetZoom]);

  return (
    <Map
      style={style}
      containerStyle={{
        height: "100vh",
        width: "100vw",
      }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      center={location}
      zoom={zoom}
      bearing={bearing}
      onZoomEnd={(map) => {
        setZoom([map.getZoom()]);
        props.setTargetZoom(map.getZoom());
      }}
      onDragEnd={(map) =>
        setLocation(map.getCenter().toArray() as [number, number])
      }
      onRotateEnd={(map) => setBearing([map.getBearing()])}
    >
      {/* Layer z-ordering hack */}
      <Source
        id="blank"
        type="geojson"
        geoJsonSource={{
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        }}
      ></Source>
      <Layer
        sourceId="blank"
        type="fill"
        id="content-mask"
        paint={{}}
        layout={{}}
      />
      <Layer
        sourceId="blank"
        type="fill"
        id="circle-mask"
        paint={{}}
        layout={{}}
      />
      <Layer
        sourceId="blank"
        type="fill"
        id="symbol-mask"
        paint={{}}
        layout={{}}
      />
      {props.show3DBuildings && (
        <Layer
          id="3d-buildings"
          sourceId="composite"
          sourceLayer="building"
          filter={["==", "extrude", "true"]}
          type="fill-extrusion"
          before="content-mask"
          minZoom={15}
          paint={{
            "fill-extrusion-color": "#FFFFFF",

            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.6,
          }}
        />
      )}

      <DataContext.Consumer>
          {(cache) => {
            return Object.entries(cache).map(([key, data]) => {
              if (data.metadata?.type == "rail-line" && (data.metadata.filterKey == null || props.lines[data.metadata.filterKey]) ) {
                return <Line
                  data={data}
                  name={key}
                  color={data.metadata.color ?? "#212121"}
                  highContrastLabels={props.accessibleLabels}
                />
              } else if (data.metadata?.type == "rail-yard" && (data.metadata.filterKey == null || props.lines[data.metadata.filterKey]) ) {
                return <RailYard name={key} data={data}/>
              }
            })
          }}
      </DataContext.Consumer> 
    </Map>
  );
});

const mapStateToProps = (state: State) => ({
  show3DBuildings: state.show3DBuildings,
  appTheme: state.appTheme,
  mapStyle: state.mapStyle,
  lines: state.lines,
  accessibleLabels: state.accessibleLabels,
  targetZoom: state.targetZoom,
});

const mapDispatchToProps = {
  setTargetZoom,
};

export const OverviewMap = connect(
  mapStateToProps,
  mapDispatchToProps
)(OverviewMapComponent);
