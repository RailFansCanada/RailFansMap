import React, { ReactNode, useContext, useState } from "react";

export type SimpleBBox = [number, number, number, number];

type MapTarget = {
  target?: SimpleBBox;
  setTarget: (target: SimpleBBox) => void;
};

const useProvideMapTarget = (): MapTarget => {
  const [target, setTarget] = useState<SimpleBBox>();

  const updateTarget = (newTarget: SimpleBBox) => {
    setTarget(newTarget);
  };

  return {
    target,
    setTarget: updateTarget,
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
