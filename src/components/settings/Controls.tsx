import React, { useState } from "react";
import { IconButton, Paper, Tooltip, Menu, MenuItem } from "@mui/material";
import { Layers, Share, GitHub, Settings, NearMe } from "@mui/icons-material";
import { ShareSheet } from "./ShareSheet";
import styled from "styled-components";
import { config, Region } from "../../config";
import { SimpleBBox, useMapTarget } from "../../hooks/useMapTarget";
import { useAppState } from "../../hooks/useAppState";

const ControlsContainer = styled.div`
  position: fixed;
  right: ${({ theme }) => theme.spacing(1)};
  top: ${({ theme }) => theme.spacing(1)};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ControlPaper = styled(Paper)`
  margin: ${({ theme }) => theme.spacing(0.5)} 0;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

type QuickNavProps = {
  open: boolean;
  onClose: () => void;
  anchorEl: Element | null;
};

const QuickNavigationMenu = (props: QuickNavProps) => {
  const { setTarget } = useMapTarget();

  const handleSelect = (selected: Region) => {
    props.onClose();
    setTarget(selected.bbox as SimpleBBox);
  };

  return (
    <Menu anchorEl={props.anchorEl} open={props.open} onClose={props.onClose}>
      <MenuItem disabled>Jump to…</MenuItem>
      {config.regions.map((region) => (
        <MenuItem
          key={region.title}
          onClick={() => {
            handleSelect(region);
          }}
        >
          {region.title}
        </MenuItem>
      ))}
    </Menu>
  );
};

export const Controls = () => {
  const [anchorEl, setAnchorEl] = useState<Element>(null);

  const handleQuickNavOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleQuickNavClose = () => {
    setAnchorEl(null);
  };

  const { setLegendDrawerOpen, setSettingsDrawerOpen, setShareSheetOpen } =
    useAppState();

  return (
    <>
      <ControlsContainer>
        <ControlPaper>
          <Tooltip title="Quick Navigation">
            <IconButton onClick={handleQuickNavOpen} size="large">
              <NearMe />
            </IconButton>
          </Tooltip>
        </ControlPaper>
        <ControlPaper>
          <Tooltip title="Map Legend">
            <IconButton onClick={() => setLegendDrawerOpen(true)} size="large">
              <Layers />
            </IconButton>
          </Tooltip>
        </ControlPaper>
        <ControlPaper>
          <Tooltip title="Map Settings">
            <IconButton
              onClick={() => setSettingsDrawerOpen(true)}
              size="large"
            >
              <Settings />
            </IconButton>
          </Tooltip>
        </ControlPaper>
        <ControlPaper>
          <Tooltip title="Share">
            <IconButton onClick={() => setShareSheetOpen(true)} size="large">
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
      <QuickNavigationMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleQuickNavClose}
      />
    </>
  );
};
