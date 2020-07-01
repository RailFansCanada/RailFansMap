import React from "react";
import {
  Card,
  CardContent,
  Typography,
  makeStyles,
  Theme,
  CardActionArea,
  fade,
  Hidden,
  ThemeProvider,
  useTheme,
} from "@material-ui/core";
import clsx from "clsx";

import image from "../../images/confederation.svg";

export interface LayerOptionProps {
  readonly primary: string;
  readonly secondary?: string;

  readonly selected?: boolean;
  readonly onClick?: () => void;

  readonly imageUrl?: string;
  readonly tint?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(2),
    borderRadius: 8,
  },
  header: {
    marginBottom: theme.spacing(1),
  },
  button: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
  },
  content: {
    display: "flex",
    flexDirection: "column",
  },
  selected: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: (props: any) => props.tint,
    backgroundColor: (props: any) => fade(props.tint, 0.2),
  },
  imagery: {
    display: "flex",
    flexGrow: 1,
    flexShrink: 0,
    width: 88,
    height: 88,
    margin: theme.spacing(1),
    borderRadius: "100%",
    overflow: "hidden",
    background: theme.palette.background.default,
    filter: "grayscale(1)",
    transition: theme.transitions.create("filter"),
    "& img": {
      width: "100%",
      height: "100%",
    },
  },
  imagerySelected: {
    filter: "grayscale(0)",
  },
}));

export const LayerOption = (props: LayerOptionProps) => {
  const theme = useTheme();
  const classes = useStyles({
    tint: props.tint ?? theme.palette.secondary.main,
  });
  return (
    <Card
      className={clsx(classes.root, { [classes.selected]: props.selected })}
      variant="outlined"
    >
      <CardActionArea
        className={classes.button}
        onClick={() => props.onClick?.()}
      >
        {props.imageUrl && (
          <div
            className={clsx(classes.imagery, {
              [classes.imagerySelected]: props.selected,
            })}
          >
            <img src={props.imageUrl} />
          </div>
        )}
        <CardContent className={classes.content}>
          <Typography className={classes.header} variant="h6">
            {props.primary}
          </Typography>
          <Typography variant="body1">{props.secondary}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
