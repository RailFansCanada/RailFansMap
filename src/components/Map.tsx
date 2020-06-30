import * as React from "react";
// import ReactMapGL, {
//   ViewState,
//   LinearInterpolator,
//   NavigationControl,
//   Layer,
//   Source,
//   FlyToInterpolator,
// } from "react-map-gl";

import ReactMapboxGl, {
  Source,
  Layer,
  ZoomControl,
  RotationControl,
} from "react-mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { Line } from "./Line";
import { RailYard } from "./RailYard";
import stage1 from "../../data/stage1.json";
import stage2south from "../../data/stage2south.json";
import stage2east from "../../data/stage2east.json";
import stage2west from "../../data/stage2west.json";
import stage3kanata from "../../data/stage3kanata.json";
import stage3barrhaven from "../../data/stage3barrhaven.json";
import belfastYard from "../../data/belfastYard.json";
import moodieYard from "../../data/moodieYard.json";
import walkleyYard from "../../data/walkleyYard.json";
import GeoJSON from "geojson";
import { State, AppTheme, MapStyle, LineState } from "../redux";
import { connect } from "react-redux";
import { Theme, makeStyles } from "@material-ui/core";
import { useIsDarkTheme } from "../app/utils";

export interface OverviewMapProps {
  readonly show3DBuildings: boolean;
  readonly appTheme: AppTheme;
  readonly mapStyle: MapStyle;
  readonly lines: LineState;
}

const Map = ReactMapboxGl({
  accessToken: MAPBOX_KEY,
  customAttribution: ["Data: City of Ottawa"],
  hash: true,
  antialias: true,
});

export const OverviewMapComponent = (props: OverviewMapProps) => {
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
      if (feature.properties.url != null) {
        window.parent.location.href = `https://www.otrainfans.ca/${feature.properties.url}`;
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

  const [style, setStyle] = React.useState("mapbox://styles/mapbox/light-v10");

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
      onZoomEnd={(map) => setZoom([map.getZoom()])}
      onDragEnd={(map) =>
        setLocation(map.getCenter().toArray() as [number, number])
      }
      onRotateEnd={(map) => setBearing([map.getBearing()])}
    >
      <ZoomControl position="bottom-right" />
      <RotationControl position="bottom-right" />
      {/* Layer z-ordering hack */}
      <Source
        id="blank"
        type="geojson"
        geoJsonSource={{
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        }}
      ></Source>
      {props.show3DBuildings && (
        <Layer
          id="3d-buildings"
          sourceId="composite"
          sourceLayer="building"
          filter={["==", "extrude", "true"]}
          type="fill-extrusion"
          before="circle-mask"
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

      {props.lines.barrhavenExtension && (
        <Line
          data={stage3barrhaven as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
          name="stage3barrhaven"
          color="#C8963E"
        />
      )}

      {props.lines.trilliumLine && (
        <>
          <RailYard
            data={walkleyYard as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
            name="Walkley Yard"
            position={[-75.65288, 45.36539]}
          />
          <Line
            data={stage2south as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
            name="stage2south"
            color="#76BE43"
          />
        </>
      )}

      {props.lines.confederationLine && (
        <>
          <RailYard
            data={belfastYard as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
            name="Belfast Yard"
            position={[-75.64087, 45.41546]}
          />
          <RailYard
            data={moodieYard as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
            name="Moodie Yard"
            position={[-75.84918, 45.33587]}
          />
          <Line
            data={stage2east as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
            name="stage2east"
            color="#D62937"
          />
          <Line
            data={stage2west as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
            name="stage2west"
            color="#D62937"
          />
          <Line
            data={stage1 as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
            name="stage1"
            color="#D62937"
          />
        </>
      )}

      {props.lines.kanataExtension && (
        <Line
          data={stage3kanata as GeoJSON.FeatureCollection<GeoJSON.Geometry>}
          name="stage3kanata"
          color="#5202F1"
        />
      )}
    </Map>
  );
};

const mapStateToProps = (state: State) => ({
  show3DBuildings: state.show3DBuildings,
  appTheme: state.appTheme,
  mapStyle: state.mapStyle,
  lines: state.lines,
});

export const OverviewMap = connect(mapStateToProps)(OverviewMapComponent);
