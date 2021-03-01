import React, { useContext, useEffect } from "react";
import { MapContext } from "react-map-gl";

import line1icon from "../images/line1.png";
import line2icon from "../images/line2.png";
import line3icon from "../images/line3.png";
import line4icon from "../images/line4.png";
import label from "../images/label.png";

const icons = [
  {
    url: line1icon,
    name: "line1icon",
  },
  {
    url: line2icon,
    name: "line2icon",
  },
  {
    url: line3icon,
    name: "line3icon",
  },
  {
    url: line4icon,
    name: "line4icon",
  },
];

export const Icons = (props: {style: string}) => {
  const { map } = useContext(MapContext);

  useEffect(() => {
    icons.forEach((icon) => {
      map.loadImage(icon.url, (error: any, image: any) => {
        if (error) throw error;
        if (!map.hasImage(icon.name)) {
          map.addImage(icon.name, image);
        }
      });
    });

    map.loadImage(label, (error: any, image: any) => {
      if (error) throw error;
      if (!map.hasImage("label-background")) {
        map.addImage("label-background", image, {
          stretchX: [[1, 24]],
          stretchY: [[1, 24]],
          content: [0, 0, 24, 24]
        })
      }
    })
  }, [props.style]);

  return <></>;
};
