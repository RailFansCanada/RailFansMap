import React, { useEffect, useState, useRef } from "react";
import { Image as MapImage } from "@urbica/react-map-gl";

export interface MapIconProps {
  id: string;
  url: string;
  width: number;
  height: number;
  style: string;
}

export const MapIcon = ({ width, height, ...props }: MapIconProps) => {
  const imageRef = useRef(new Image(width, height));
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const img = imageRef.current;
    img.onload = () => {
      setLoaded(true);
    };
    img.src = props.url;
  }, [props.style]);

  return loaded ? <MapImage id={props.id} image={imageRef.current} /> : <></>;
};
