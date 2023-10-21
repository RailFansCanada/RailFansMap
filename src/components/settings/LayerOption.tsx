import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Theme,
  CardActionArea,
  alpha,
  useTheme,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import styled from "@emotion/styled";

export type LayerOptionProps = {
  primary: string;
  secondary?: string;

  selected?: boolean;
  onClick?: () => void;

  imageUrl?: string;
  tint?: string;
};

const CardTitle = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const OptionContent = styled(CardContent)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const OptionCard = styled(Card)<{ selected: boolean; tint?: string }>`
  margin: ${({ theme }) => theme.spacing(2)};
  border-radius: 8px;
  ${({ selected, tint }) => selected && `background-color:${alpha(tint, 0.1)};`}
`;

const OptionActionArea = styled(CardActionArea)`
  display: flex;
  flex-direction: row;
  justify-content: start;
`;

const Imagery = styled.div<{ selected: boolean }>`
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  margin: ${({ theme }) => theme.spacing(1)};
  border-radius: 100%;
  overflow: hidden;
  background: ${({ theme }) => theme.palette.background.default};
  filter: ${({ selected }) => (selected ? "grayscale(0)" : "grayscale(1)")};
  transition: ${({ theme }) => theme.transitions.create("filter")};
  & img {
    width: 100%;
    height: 100%;
  }
  border: 1px solid ${({ theme }) => theme.palette.text.disabled};
`;

export const LayerOption = (props: LayerOptionProps) => {
  const theme = useTheme();
  return (
    <OptionCard
      variant="outlined"
      selected={props.selected}
      tint={props.tint ?? theme.palette.secondary.main}
    >
      <OptionActionArea onClick={() => props.onClick?.()}>
        {props.imageUrl && (
          <Imagery selected={props.selected}>
            <img src={props.imageUrl} />
          </Imagery>
        )}
        <OptionContent>
          <CardTitle variant="h6">{props.primary}</CardTitle>
          <Typography variant="body1">{props.secondary}</Typography>
        </OptionContent>
      </OptionActionArea>
    </OptionCard>
  );
};
