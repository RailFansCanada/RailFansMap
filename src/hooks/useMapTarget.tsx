import React, { ReactNode, useContext, useState } from "react";

export type SimpleBBox = [number, number, number, number];

type MapTarget = {
  target?: SimpleBBox;
  setTarget: (target: SimpleBBox) => void;

  currentZoom?: number;
  targetZoom?: number;
  setCurrentZoom: (zoom: number) => void;
  setTargetZoom: (zoom: number) => void;

  currentBearing?: number;
  targetBearing?: number;
  setCurrentBearing: (bearing: number) => void;
  setTargetBearing: (bearing: number) => void;
};

const useProvideMapTarget = (): MapTarget => {
  const [target, setTarget] = useState<SimpleBBox>();
  const [currentZoom, setCurrentZoom] = useState<number>();
  const [targetZoom, setTargetZoom] = useState<number>();
  const [currentBearing, setCurrentBearing] = useState<number>();
  const [targetBearing, setTargetBearing] = useState<number>();

  const updateTarget = (newTarget: SimpleBBox) => {
    setTarget(newTarget);
  };

  return {
    target,
    setTarget: updateTarget,
    currentZoom,
    targetZoom,
    setCurrentZoom,
    setTargetZoom,
    currentBearing,
    targetBearing,
    setCurrentBearing,
    setTargetBearing
  };
};

const MapTargetContext = React.createContext<MapTarget>(null);

export const ProvideMapTarget = (props: { children: ReactNode }) => {
  const cache = useProvideMapTarget();

  return (
    <MapTargetContext.Provider value={cache}>
      {props.children}
    </MapTargetContext.Provider>
  );
};

export const useMapTarget = () => useContext(MapTargetContext);
