import React, { useContext, useEffect, useCallback, useRef } from "react";
import { MapContext } from "react-map-gl";

export interface MapIconProps {
  id: string;
  url: string;
  width: number;
  height: number;
  style: string;
}

export const MapIcon = ({ width, height, ...props }: MapIconProps) => {
  const { map } = useContext(MapContext);
  const imageRef = useRef(new Image(width, height));

  useEffect(() => {
    const img = imageRef.current;
    img.onload = () => {
      console.log(img);
      map.on("styledata", () => {
        if (!map.hasImage(props.id)) {
          map.addImage(props.id, img);
        }
      });
    };
    img.src = props.url;
  }, [props.style]);

  return <></>;
};
