import React, { useRef, useState } from "react";
import {
  Checkbox,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import styled from "styled-components";
import { MenuDrawer } from "./MenuDrawer";
import { Agency } from "../../config";
import { Dataset } from "../../hooks/useData";
import { Chevron } from "../Chevron";
import { BBox } from "geojson";
import { SimpleBBox, useMapTarget } from "../../hooks/useMapTarget";
import { useAppState } from "../../hooks/useAppState";

type EntryData = {
  id: string;
  title: string;
  description: string;
  tint: string;
  bbox?: BBox;
  icon?: string;
  filterKey?: string;
};

type LegendDrawerProps = {
  visible: Agency[];
  allAgencies: Agency[];
  data: Dataset;
};

type LegendGroupProps = {
  agency: Agency;
  entries: EntryData[];
};

type LegendEntryProps = Omit<EntryData, "id"> & {
  onChecked: () => void;
  enabled?: boolean;
};

const LegendEntryColorBar = styled.div<{ tint: string }>`
  width: 5px;
  background-color: ${(props) => props.tint};
  display: flex;
  align-self: stretch;
  margin: ${({ theme }) => theme.spacing(1)};
`;

const LegendEntryItem = styled(ListItem)<{ checked: boolean }>`
  filter: ${({ checked }) => (checked ? "grayscale(0)" : "grayscale(1)")};
  transition: ${({ theme }) => theme.transitions.create("filter")};

  & .Mui-disabled {
    opacity: 1;
  }
`;

const LegendEntry = (props: LegendEntryProps) => {
  const { setTarget } = useMapTarget();

  return (
    <LegendEntryItem
      disablePadding
      dense
      checked={props.enabled}
      secondaryAction={
        props.filterKey && (
          <Checkbox
            style={{ color: props.tint }}
            checked={props.enabled}
            onChange={props.onChecked}
            edge="end"
          />
        )
      }
    >
      <ListItemButton
        disabled={!props.enabled}
        onClick={() => {
          if (props.bbox != null) {
            setTarget(props.bbox as SimpleBBox);
          }
        }}
      >
        {props.icon && (
          <ListItemAvatar>
            <img src={props.icon} />
          </ListItemAvatar>
        )}
        <LegendEntryColorBar tint={props.tint} />
        <ListItemText primary={props.title} secondary={props.description} />
      </ListItemButton>
    </LegendEntryItem>
  );
};

const LegendGroupContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
`;

const LegendGroupHeader = styled(ListItemButton)`
  width: 100%;
  display: flex;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const LegendGroupActions = styled.div``;

const LegendGroup = (props: LegendGroupProps) => {
  const theme = useTheme();
  const {
    lineFilterState,
    setLineFiltered,
    legendGroupState,
    setLegendGroupOpen,
  } = useAppState();

  const containerRef = useRef<HTMLDivElement>(null);

  const open = legendGroupState[props.agency.id] ?? false;
  const handleExpand = () => {
    setLegendGroupOpen(props.agency.id, !open);

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
      <LegendGroupHeader onClick={handleExpand}>
        <Typography variant="subtitle1">{props.agency.name}</Typography>
        <div>
          {/* <IconButton>
            <Fullscreen />
          </IconButton> */}
          <Chevron down={open} color={theme.palette.text.primary} />
        </div>
      </LegendGroupHeader>
      <Collapse in={open}>
        {props.entries.map((entry) => {
          const filterKey = entry.filterKey;
          let enabled: boolean;
          if (filterKey === undefined) {
            enabled = true;
          } else {
            enabled = lineFilterState[filterKey] ?? false;
          }
          return (
            <LegendEntry
              key={entry.id}
              {...entry}
              enabled={enabled}
              onChecked={() => {
                setLineFiltered(filterKey, !enabled);
              }}
            />
          );
        })}
      </Collapse>
      <Divider />
    </LegendGroupContainer>
  );
};

export const LegendDrawer = (props: LegendDrawerProps) => {
  const { legendDrawerOpen, setLegendDrawerOpen } = useAppState();

  return (
    <MenuDrawer
      open={legendDrawerOpen}
      onClose={() => setLegendDrawerOpen(false)}
      title="Map Legend"
    >
      <List>
        {props.allAgencies.map((value) => {
          const entries: EntryData[] = value.data
            .map((id) => ({
              ...props.data[id]?.metadata,
              bbox: props.data[id]?.bbox,
            }))
            .filter((metadata) => metadata?.type === "rail-line")
            .map((metadata) => ({
              id: metadata.id,
              title: metadata.name,
              description: metadata.description,
              tint: metadata.color,
              bbox: metadata.bbox,
              icon: `icons/${metadata.icon}`,
              filterKey: metadata.filterKey,
            }));
          return (
            <LegendGroup agency={value} key={value.id} entries={entries} />
          );
        })}
      </List>
    </MenuDrawer>
  );
};
