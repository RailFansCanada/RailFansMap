import React, { useCallback, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Tooltip, IconButton, Divider } from "@mui/material";
import {
  Add,
  Remove,
  Navigation,
  GpsFixed,
  GpsNotFixed,
} from "@mui/icons-material";
import { ControlPaper } from "./Controls";
import { useMap } from "react-map-gl";
import { SimpleBBox, useMapTarget } from "../hooks/useMapTarget";
import buffer from "@turf/buffer";
import bbox from "@turf/bbox";
import { useGeolocation } from "../hooks/useGeolocation";
import { useWindow } from "../hooks/useWindow";
import { useAppState } from "../hooks/useAppState";

const MapControlContainer = styled.div<{
  hidden: boolean;
  smallPadding: boolean;
}>`
  display: flex;
  flex-direction: column;
  position: fixed;
  right: ${({ theme, hidden }) =>
    hidden ? theme.spacing(-8) : theme.spacing(1)};
  bottom: ${({ theme, smallPadding }) => theme.spacing(smallPadding ? 4 : 5)};
  z-index: 1;
  transition: ${({ theme }) => theme.transitions.create("right")};
`;

export const MapControls = () => {
  const { setTarget } = useMapTarget();
  const { current: map } = useMap();
  const [bearing, setBearing] = useState(map?.getBearing() ?? 0);
  const [targetingCurrentLocation, setTargetingCurrentLocation] =
    useState(false);
  const { requestGeolocation, requestGeolocationWatch } = useGeolocation();
  const [willBeFlying, setWillBeFyling] = useState(false);
  const { searchOpen } = useAppState();
  const [width] = useWindow();

  useEffect(() => {
    map?.on("rotate", (e) => {
      setBearing(e.target.getBearing());
    });
    map?.on("movestart", () => {
      if (willBeFlying) {
        setWillBeFyling(false);
        setTargetingCurrentLocation(true);
      } else {
        setTargetingCurrentLocation(false);
      }
    });
    map?.on("moveend", () => {});
  }, []);

  const handleJumpToCurrentLocation = useCallback(() => {
    requestGeolocation().then((geolocation) => {
      const buffered = buffer(
        {
          type: "Point",
          coordinates: geolocation,
        },
        0.5,
        { units: "kilometers" }
      );
      setTarget(bbox(buffered) as SimpleBBox);
      setTargetingCurrentLocation(true);
      setWillBeFyling(true);
      requestGeolocationWatch();
    });
  }, []);

  return (
    <MapControlContainer
      smallPadding={width > 600}
      hidden={!(width > 600) && searchOpen}
    >
      <ControlPaper>
        <Tooltip title="Jump to Current Location" placement="left">
          <IconButton size="large" onClick={handleJumpToCurrentLocation}>
            {targetingCurrentLocation ? <GpsFixed /> : <GpsNotFixed />}
          </IconButton>
        </Tooltip>
      </ControlPaper>
      <ControlPaper>
        <Tooltip title="Zoom In" placement="left">
          <IconButton
            size="large"
            onClick={() => {
              map?.zoomIn();
            }}
          >
            <Add />
          </IconButton>
        </Tooltip>
        <Divider />
        <Tooltip title="Zoom Out" placement="left">
          <IconButton
            size="large"
            onClick={() => {
              map?.zoomOut();
            }}
          >
            <Remove />
          </IconButton>
        </Tooltip>
      </ControlPaper>
      <ControlPaper>
        <Tooltip title="Reset Orientation" placement="left">
          <IconButton
            size="large"
            onClick={() => {
              map?.resetNorth();
            }}
          >
            <Navigation
              style={{
                transform: `rotate(${-bearing}deg)`,
              }}
            />
          </IconButton>
        </Tooltip>
      </ControlPaper>
    </MapControlContainer>
  );
};
