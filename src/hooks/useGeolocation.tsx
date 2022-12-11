import { Position } from "geojson";
import React, { useContext, useEffect, useState, useRef } from "react";

export type GeolocationProps = {
  geolocation?: Position;
  requestGeolocation: () => Promise<Position>;
  requestGeolocationWatch: () => void;
};

const useProvideGeolocation = (): GeolocationProps => {
  const watchRef = useRef<number>(null);
  const [geolocation, setGeolocation] = useState<Position>();

  const handleRequest = async (): Promise<Position> => {
    if (geolocation) {
      return geolocation;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          setGeolocation(location);
          resolve(location);
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true }
      );
    });
  };

  const handleWatchRequest = () => {
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current);
    }

    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setGeolocation([position.coords.longitude, position.coords.latitude]);
      },
      () => {},
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted") {
        handleRequest();
      }
    });
  }, []);

  return {
    geolocation,
    requestGeolocation: handleRequest,
    requestGeolocationWatch: handleWatchRequest,
  };
};

const GeolocationContext = React.createContext<GeolocationProps>({
  requestGeolocationWatch: () => {},
  requestGeolocation: () => {
    return null;
  },
});

export const ProvideGeolocation = (props: { children: React.ReactNode }) => {
  const cache = useProvideGeolocation();

  return (
    <GeolocationContext.Provider value={cache}>
      {props.children}
    </GeolocationContext.Provider>
  );
};

export const useGeolocation = () => useContext(GeolocationContext);
