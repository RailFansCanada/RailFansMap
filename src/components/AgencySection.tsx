import {
  Card,
  CardContent,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import { Agency } from "../config";
import { LoadedMetadata } from "../hooks/useData";
import React, { useMemo } from "react";
import Scrollbars from "react-custom-scrollbars";
import styled from "@emotion/styled";

export type AgencySectionProps = {
  agency: Agency;
  metadata: LoadedMetadata[];
};

const HorizontalScrollbars = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  gap: 8px;
`;

const StyledCard = styled(Card)`
  aspect-ratio: 1;
  height: 156px;
  flex-shrink: 0;
`;

const LineCard = (props: LoadedMetadata) => {
  return (
    <StyledCard elevation={2}>
      <CardContent>
        {props.icon && <img src={`icons/${props.icon}`} />}
        <Typography variant="body1">{props.name}</Typography>
      </CardContent>
    </StyledCard>
  );
};

const LineColorBar = styled.div<{ tint: string }>`
  width: 5px;
  background-color: ${(props) => props.tint};
  display: flex;
  align-self: stretch;
  margin: ${({ theme }) => theme.spacing(1)};
`;

const LineRow = (props: LoadedMetadata) => {
  return (
    <ListItemButton dense key={props.id}>
      {props.icon && (
        <ListItemAvatar>
          <img src={`icons/${props.icon}`} />
        </ListItemAvatar>
      )}
      <LineColorBar tint={props.color} />
      <ListItemText primary={props.name} secondary={props.description} />
    </ListItemButton>
  );
};

export const AgencySection = (props: AgencySectionProps) => {
  const theme = useTheme();

  const planned = useMemo(
    () => props.metadata.filter((meta) => meta.filterKey != null),
    [props.metadata]
  );

  return (
    <div>
      <Typography variant="h6" style={{ padding: theme.spacing(0, 2) }}>
        {props.agency.name}
      </Typography>
      <List>
        {props.metadata
          .filter((meta) => meta.filterKey == null)
          .map((meta) => (
            //   <LineCard {...meta} />
            <LineRow {...meta} />
          ))}

        {/* Planned lines and extensions */}
        {planned.length > 0 && (
          <Typography variant="body2" style={{ padding: theme.spacing(1, 2) }}>
            Planned
          </Typography>
        )}
        {planned.map((meta) => (
          //   <LineCard {...meta} />
          <LineRow {...meta} />
        ))}
      </List>
    </div>
  );
};
