import React from "react";
import { ButtonBase, Paper, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { Chevron } from "./Chevron";
import TouchRipple from "@mui/material/ButtonBase/TouchRipple";

const BottomSheetSurface = styled(Paper)`
  position: absolute;
  width: 40vw;
  min-width: 500px;
  left: ${({ theme }) => theme.spacing(1)};
  bottom: 0;
  z-index: 50;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
`;

const HeaderContainer = styled(ButtonBase)`
  height: ${({ theme }) => theme.spacing(7)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(0, 2)};
  display: flex;
  box-sizing: border-box;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const BottomSheetHeader = () => {
  return (
    <HeaderContainer>
      <Typography>On the Map</Typography>
      <Chevron down={true} />
    </HeaderContainer>
  );
};

export const BottomSheet = () => {
  return (
    <BottomSheetSurface>
      <BottomSheetHeader />
    </BottomSheetSurface>
  );
};
