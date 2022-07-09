import React, { useEffect, useRef } from "react";
import { useMap } from "react-map-gl";

export type MapIconProps = {
  id: string;
  url: string;
  width: number;
  height: number;
  style: string;
};

export type Stretch = {
  stretchX: [number, number][];
  stretchY: [number, number][];
  content: [number, number, number, number];
};

export const MapIcon = ({ width, height, ...props }: MapIconProps) => {
  const scale = window.devicePixelRatio;
  const imageRef = useRef(new Image(width * scale, height * scale));
  const { current: map } = useMap();

  const addToMap = () => {
    if (!map.hasImage(props.id)) {
      map.addImage(props.id, imageRef.current, { pixelRatio: scale });
    }
  };

  useEffect(() => {
    const img = imageRef.current;
    img.onload = () => {
      addToMap();
    };
    img.src = props.url;

    map.on("styleimagemissing", (e) => {
      if (e.id === props.id) {
        addToMap();
      }
    });

    return () => {
      if (map.hasImage(props.id)) {
        map.removeImage(props.id);
      }
    };
  }, []);
  return <></>;
};
