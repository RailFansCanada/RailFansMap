import React, { ReactNode } from "react";
import { AppBar, Drawer, IconButton, Toolbar, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { Close } from "@mui/icons-material";
import Scrollbars from "react-custom-scrollbars";

const StyledDrawer = styled(Drawer)`
  & .MuiDrawer-paper {
    width: 420px;
    ${({ theme }) => theme.breakpoints.down("md")} {
      width: 100%;
    }
    box-shadow: ${({ theme }) => theme.shadows[4]};
  }
`;

const DrawerAppBar = styled(AppBar)`
  background-color: ${({ theme }) => theme.palette.background.default};
  display: flex;
  flex-grow: 0;
`;

const CloseButton = styled(IconButton)`
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const DrawerTitle = styled(Typography)`
  flex-grow: 1;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const DrawerContentContainer = styled.div`
  display: flex;
  flex-grow: 1;
  height: 100%;
`;

type MenuDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;

  children?: ReactNode;
};

export const MenuDrawer = (props: MenuDrawerProps) => {
  return (
    <StyledDrawer
      variant="persistent"
      anchor="right"
      open={props.open}
      elevation={4}
    >
      <DrawerAppBar position="static">
        <Toolbar>
          <CloseButton edge="start" size="large" onClick={props.onClose}>
            <Close />
          </CloseButton>
          <DrawerTitle variant="h6">{props.title}</DrawerTitle>
        </Toolbar>
      </DrawerAppBar>
      <DrawerContentContainer>
        <Scrollbars>{props.children}</Scrollbars>
      </DrawerContentContainer>
    </StyledDrawer>
  );
};
