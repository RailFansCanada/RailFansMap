import React from "react";
import styled from "styled-components";

export const Chevron = styled.div<{ down: boolean; color?: string }>`
  display: inline-block;
  margin-top: 6px;
  min-width: 16px;
  &:before {
    width: 4px;
    height: 12px;
    transition: all 0.5s cubic-bezier(0.33, 1, 0.68, 1);
    display: inline-block;
    border-radius: 8px;
    background: ${(props) => props.color ?? "#FFFFFF"};
    transform: ${(props) =>
      props.down ? "rotate(-135deg)" : "rotate(-45deg)"};
    content: "";
  }
  &:after {
    width: 4px;
    height: 12px;
    transition: all 0.5s cubic-bezier(0.33, 1, 0.68, 1);
    display: inline-block;
    border-radius: 8px;
    background: ${(props) => props.color ?? "#FFFFFF"};
    transform: ${(props) =>
      props.down ? "rotate(-45deg)" : "rotate(-135deg)"};
    content: "";
    margin-left: 3px;
  }
`;
