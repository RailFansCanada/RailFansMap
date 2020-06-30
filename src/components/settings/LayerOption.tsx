import React from "react";
import {
  Card,
  CardContent,
  Typography,
  makeStyles,
  Theme,
  CardActionArea,
  fade,
} from "@material-ui/core";
import clsx from "clsx";

export interface LayerOptionProps {
  readonly primary: string;
  readonly secondary?: string;

  readonly selected?: boolean;
  readonly onClick?: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(2),
    borderRadius: 8,
  },
  header: {
    marginBottom: theme.spacing(1),
  },
  selected: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.primary.main,
    backgroundColor: fade(theme.palette.primary.main, 0.2),
  },
}));

export const LayerOption = (props: LayerOptionProps) => {
  const classes = useStyles();
  return (
    <Card
      className={clsx(classes.root, { [classes.selected]: props.selected })}
      variant="outlined"
    >
      <CardActionArea onClick={() => props.onClick?.()}>
        <CardContent>
          <Typography className={classes.header} variant="h6">
            {props.primary}
          </Typography>
          <Typography variant="body1">{props.secondary}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
