import * as React from "react";
import { IconButton, Theme, Paper, Tooltip } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Layers, Share, GitHub } from "@mui/icons-material";
import { setDrawerOpen, setShareSheetOpen } from "../../redux";
import { connect } from "react-redux";
import { ShareSheet } from "./ShareSheet";
import styled from "styled-components";

interface ControlsProps {
  readonly setDrawerOpen: typeof setDrawerOpen;
  readonly setShareSheetOpen: typeof setShareSheetOpen;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "fixed",
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  share: {
    marginTop: theme.spacing(1),
  },
}));

const ControlsContainer = styled.div(
  ({ theme }) => `
  position: fixed;
  right: ${theme.spacing(1)};
  top: ${theme.spacing(1)};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
);

const ControlPaper = styled(Paper)(
  ({ theme }) => `
  margin: ${theme.spacing(0.5)} 0;
  
  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`
);

const ControlsComponent = (props: ControlsProps) => {
  const classes = useStyles();
  return (
    <>
      <ControlsContainer>
        <ControlPaper>
          <Tooltip title="Map Settings">
            <IconButton onClick={() => props.setDrawerOpen(true)} size="large">
              <Layers />
            </IconButton>
          </Tooltip>
        </ControlPaper>
        <ControlPaper>
          <Tooltip title="Share">
            <IconButton
              onClick={() => props.setShareSheetOpen(true)}
              size="large"
            >
              <Share />
            </IconButton>
          </Tooltip>
        </ControlPaper>
        <ControlPaper>
          <Tooltip title="Contribute on GitHub">
            <IconButton
              href="https://github.com/RailFansCanada/RailFansMap"
              size="large"
            >
              <GitHub />
            </IconButton>
          </Tooltip>
        </ControlPaper>
      </ControlsContainer>
      <ShareSheet />
    </>
  );
};

const mapDispatchToProps = {
  setDrawerOpen,
  setShareSheetOpen,
};

export const Controls = connect(null, mapDispatchToProps)(ControlsComponent);
