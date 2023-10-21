import React, { useEffect, useState } from "react";
import {
  IconButton,
  Paper,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  Layers,
  Share,
  GitHub,
  Settings,
  NearMe,
  Feedback,
} from "@mui/icons-material";
import { ShareSheet } from "./ShareSheet";
import styled from "@emotion/styled";
import { config, Region } from "../../config";
import { SimpleBBox, useMapTarget } from "../../hooks/useMapTarget";
import { useAppState } from "../../hooks/useAppState";
import TouchRipple from "@mui/material/ButtonBase/TouchRipple";
import { useWindow } from "../../hooks/useWindow";
import { ControlPaper } from "../Controls";

const ControlsContainer = styled.div<{ hidden: boolean }>`
  position: fixed;
  right: ${({ theme, hidden }) =>
    hidden ? theme.spacing(-8) : theme.spacing(1)};
  top: ${({ theme }) => theme.spacing(1)};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: ${({ theme }) => theme.transitions.create("right")};
  z-index: 500;
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
  const rippleTimeoutRef = React.useRef<number>(null);

  const handleQuickNavOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    localStorage["quickNav"] = true;
    if (rippleTimeoutRef.current) {
      clearTimeout(rippleTimeoutRef.current);
    }
    setAnchorEl(e.currentTarget);
  };

  const handleQuickNavClose = () => {
    setAnchorEl(null);
  };

  const {
    setLegendDrawerOpen,
    setSettingsDrawerOpen,
    setShareSheetOpen,
    searchOpen,
  } = useAppState();
  const [width] = useWindow();

  const rippleRef = React.useRef(null);
  const buttonRef = React.useRef(null);

  const triggerRipple = () => {
    const container = buttonRef.current;
    const rect = container.getBoundingClientRect();

    rippleRef.current.start(
      {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      },
      { center: false }
    );

    setTimeout(() => rippleRef.current.stop({}), 320);
  };

  useEffect(() => {
    if (!localStorage["quickNav"]) {
      const repeatRipple = () => {
        triggerRipple();
        if (!localStorage["quickNav"]) {
          rippleTimeoutRef.current = window.setTimeout(repeatRipple, 2000);
        }
      };
      repeatRipple();
    }
  }, []);

  return (
    <>
      <ControlsContainer hidden={!(width > 600) && searchOpen}>
        <ControlPaper>
          <Tooltip title="Quick Navigation">
            <IconButton
              ref={buttonRef}
              onClick={handleQuickNavOpen}
              size="large"
            >
              <TouchRipple ref={rippleRef} center />
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
          <Divider />
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
