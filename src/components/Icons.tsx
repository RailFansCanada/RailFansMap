import React, { useEffect, useState, useRef } from "react";
import { Image as MapImage } from "@urbica/react-map-gl";

export interface MapIconProps {
  id: string;
  url: string;
  width: number;
  height: number;
  style: string;
}

export type Stretch = {
  stretchX: [number, number][];
  stretchY: [number, number][];
  content: [number, number, number, number];
};

export const MapIcon = ({ width, height, ...props }: MapIconProps) => {
  const scale = window.devicePixelRatio;
  const imageRef = useRef(new Image(width * scale, height * scale));
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const img = imageRef.current;
    img.onload = () => {
      setLoaded(true);
    };
    img.src = props.url;
  }, [props.style]);

  return loaded ? (
    <MapImage id={props.id} image={imageRef.current} pixelRatio={scale} />
  ) : (
    <></>
  );
};
