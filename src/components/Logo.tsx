import React from "react";
import { useIsDarkTheme } from "../app/utils";
import logoLight from "../images/logoLight.svg";
import logoDark from "../images/logoDark.svg";
import { useAppState } from "../hooks/useAppState";
import styled from "styled-components";

const LogoImg = styled.img`
  position: fixed;
  width: 140px;
  bottom: ${({ theme }) => theme.spacing(2)};
  left: calc(50% - 70px);
`;

export const Logo = () => {
  const { appTheme } = useAppState();
  const isDarkTheme = useIsDarkTheme(appTheme);

  return (
    <a href="https://www.railfans.ca">
      <LogoImg alt="RailFans Canada Logo" src={isDarkTheme ? logoDark : logoLight} />
    </a>
  );
};
