import React, { useRef, useState } from "react";
import {
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import { setLegendDrawerOpen, State } from "../../redux";
import { connect } from "react-redux";
import styled from "styled-components";
import { MenuDrawer } from "./MenuDrawer";
import { Agency } from "../../config";
import { Dataset } from "../../hooks/useData";
import { LayerOption2 } from "./LayerOption";
import { Fullscreen } from "@mui/icons-material";
import { Chevron } from "../Chevron";
import { BBox } from "geojson";

type EntryData = {
  id: string;
  title: string;
  description: string;
  tint: string;
  bbox?: BBox;
  icon?: string;
};

type LegendDrawerProps = {
  open: boolean;
  setLegendDrawerOpen: typeof setLegendDrawerOpen;

  visible: Agency[];
  allAgencies: Agency[];
  data: Dataset;
};

type LegendGroupProps = {
  title: string;
  entries: EntryData[];
};

type LegendEntryProps = {
  title: string;
  description: string;
  tint: string;
  icon?: string;
};

const LegendEntryColorBar = styled.div<{ tint: string }>`
  width: 5px;
  background-color: ${(props) => props.tint};
  display: flex;
  align-self: stretch;
  margin: ${({ theme }) => theme.spacing(1)};
`;

const LegendEntry = (props: LegendEntryProps) => {
  return (
    <ListItem disablePadding dense>
      <ListItemButton>
        {props.icon && (
          <ListItemAvatar>
            <img src={props.icon} />
          </ListItemAvatar>
        )}
        <LegendEntryColorBar tint={props.tint} />
        <ListItemText primary={props.title} secondary={props.description} />
      </ListItemButton>
    </ListItem>
  );
};

const LegendGroupContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
`;

const LegendGroupHeader = styled.div`
  width: 100%;
  display: flex;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const LegendGroupActions = styled.div``;

const LegendGroup = (props: LegendGroupProps) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleExpand = () => {
    setOpen(!open);

    // Scroll so that the bottom of the group is in view
    if (!open) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({
          block: "end",
          behavior: "smooth",
        });
      }, 300);
    }
  };

  return (
    <LegendGroupContainer ref={containerRef}>
      <LegendGroupHeader>
        <Typography variant="subtitle1">{props.title}</Typography>
        <div>
          <IconButton>
            <Fullscreen />
          </IconButton>
          <IconButton onClick={handleExpand}>
            <Chevron down={open} color={theme.palette.text.primary} />
          </IconButton>
        </div>
      </LegendGroupHeader>
      <Collapse in={open}>
        {props.entries.map((entry) => {
          return <LegendEntry key={entry.id} {...entry} />;
        })}
      </Collapse>
      <Divider />
    </LegendGroupContainer>
  );
};

const LegendDrawerComponent = (props: LegendDrawerProps) => {
  return (
    <MenuDrawer
      open={props.open}
      onClose={() => props.setLegendDrawerOpen(false)}
      title="Map Legend"
    >
      <List>
        {props.allAgencies.map((value) => {
          const entries: EntryData[] = value.data
            .map((id) => props.data[id]?.metadata)
            .filter((metadata) => metadata?.type === "rail-line")
            .map((metadata) => ({
              id: metadata.id,
              title: metadata.name,
              description: metadata.description,
              tint: metadata.color,
              icon: `icons/${metadata.icon}`,
            }));
          return (
            <LegendGroup
              key={value.name}
              title={value.name}
              entries={entries}
            />
          );
        })}
      </List>
    </MenuDrawer>
  );
};

const mapStateToProps = (state: State) => ({
  open: state.legendDrawerOpen,
});

const mapDispatchToProps = {
  setLegendDrawerOpen,
};

export const LegendDrawer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LegendDrawerComponent);
