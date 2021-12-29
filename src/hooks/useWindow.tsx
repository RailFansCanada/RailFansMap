import React, { useContext, useEffect, useState } from "react";

const useProvideWindow = (): [number, number] => {
  const [size, setSize] = useState<[number, number]>([
    window.innerWidth,
    window.innerHeight,
  ]);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setSize([window.innerWidth, window.innerHeight]);
    });
  }, []);

  return size;
};

const WindowContext = React.createContext<[number, number]>([0, 0]);

export const ProvideWindow = (props: { children: React.ReactNode }) => {
  const cache = useProvideWindow();

  return (
    <WindowContext.Provider value={cache}>
      {props.children}
    </WindowContext.Provider>
  );
};

export const useWindow = () => useContext(WindowContext);
