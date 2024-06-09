import React from "react";
import styled from "@emotion/styled";

export const Chevron = styled.div<{ down: boolean; color?: string }>`
  display: inline-block;
  margin-top: 4px;
  width: 24px;
  height: 20px;
  &:before {
    width: 3px;
    height: 10px;
    transition: all 0.5s cubic-bezier(0.33, 1, 0.68, 1);
    display: inline-block;
    border-radius: 2px;
    background: ${(props) => props.color ?? "#FFFFFF"};
    transform: ${(props) =>
      props.down ? "rotate(-135deg)" : "rotate(-45deg)"};
    content: "";
    margin-left: 7px;
  }
  &:after {
    width: 3px;
    height: 10px;
    transition: all 0.5s cubic-bezier(0.33, 1, 0.68, 1);
    display: inline-block;
    border-radius: 2px;
    background: ${(props) => props.color ?? "#FFFFFF"};
    transform: ${(props) =>
      props.down ? "rotate(-45deg)" : "rotate(-135deg)"};
    content: "";
    margin-left: 3px;
  }
`;
