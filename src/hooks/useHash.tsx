import React, { useContext } from "react";
import { ViewportProps } from "react-map-gl";

const useProvideHash = (): ViewportProps => {
    const hash = window.location.hash
    if (hash.length === 0) { return {} }

    const parts = hash.substring(1).split("/");
    
    let zoom = parseFloat(parts[0]);
    let lat = parseFloat(parts[1]);
    let lng = parseFloat(parts[2]);    
    let bearing = parseFloat(parts[3]);
    let pitch: number = NaN;
    if (parts.length > 4) {
        pitch = parseFloat(parts[4]);
    }

    let result: ViewportProps = {};
    if (!isNaN(zoom)) {
        result = {zoom};
    }
    if (!isNaN(lat)) {
        result = {...result, latitude: lat};
    }
    if (!isNaN(lng)) {
        result = {...result, longitude: lng};
    }
    if (!isNaN(bearing)) {
        result = {...result, bearing};
    }
    if (!isNaN(pitch)) {
        result = {...result, pitch};
    }

    return result;
}

const HashContext = React.createContext<ViewportProps>({});

export const ProvideHash = (props: { children: React.ReactNode }) => {
  const cache = useProvideHash();

  return (
    <HashContext.Provider value={cache}>{props.children}</HashContext.Provider>
  );
};

export const useHash = () => useContext(HashContext);
