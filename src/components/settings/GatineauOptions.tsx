import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Theme,
  CardActionArea,
  alpha,
  useTheme,
  Collapse,
  List,
  ListItemText,
  ListItem,
  ListItemIcon,
  Checkbox,
  Divider,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

export interface GatineauOptionProps {
  readonly primary: string;
  readonly secondary?: string;
  readonly tertiary?: string;

  readonly selected?: boolean;
  readonly onClick?: () => void;

  readonly imageUrl?: string;
  readonly tint?: string;

  // readonly alternatives: Alternatives;
  // readonly enableAlternative: typeof enableAlternative;
  // readonly disableAlternative: typeof disableAlternative;
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
    flexGrow: 1,
  },
  selected: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: (props: any) => props.tint,
    backgroundColor: (props: any) => alpha(props.tint, 0.1),
  },
  imagery: {
    display: "flex",
    flexGrow: 0,
    flexShrink: 0,
    width: 88,
    height: 88,
    margin: theme.spacing(1),
    borderRadius: "100%",
    overflow: "hidden",
    background: theme.palette.background.default,
    transform: "scaleX(-1)",
    filter: "grayscale(1)",
    transition: theme.transitions.create("filter"),
    "& img": {
      width: "100%",
      height: "100%",
    },
    border: `1px solid ${theme.palette.text.disabled}`,
  },
  imagerySelected: {
    filter: "grayscale(0)",
    borderColor: (props) => (props as any).tint,
  },
}));

export const GatineauOptionComponent = (props: GatineauOptionProps) => {
  const theme = useTheme();
  const classes = useStyles({
    tint: props.tint ?? theme.palette.secondary.main,
  });

  const setAlternative = (value: boolean, alternative: string) => {
    if (value) {
      //props.enableAlternative(["gatineauLrt", alternative]);
    } else {
      //props.disableAlternative(["gatineauLrt", alternative]);
    }
  };

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
          <Typography variant="caption">{props.tertiary}</Typography>
        </CardContent>
      </CardActionArea>
      <Collapse in={props.selected}>
        <Divider />
        <List>
          <AlternativeItem
            primary="Sparks Tunnel"
            secondary="Tunnel under Sparks Street"
            checked
            //checked={props.alternatives["gatineauLrt"]?.includes("1")}
            onCheck={(checked) => {
              setAlternative(checked, "1");
            }}
          />
          <AlternativeItem
            primary="Wellington Street"
            secondary="Tracks at street level on Wellington"
            checked
            //checked={props.alternatives["gatineauLrt"]?.includes("2")}
            onCheck={(checked) => {
              setAlternative(checked, "2");
            }}
          />
        </List>
      </Collapse>
    </Card>
  );
};

const useCheckboxStyles = makeStyles((theme: Theme) => ({
  root: {
    color: theme.palette.text.primary,
  },
}));

const AlternativeItem = (props: {
  primary: string;
  secondary: string;
  checked: boolean;
  onCheck: (checked: boolean) => void;
}) => {
  const classes = useCheckboxStyles();
  return (
    <ListItem
      button
      onClick={() => {
        props.onCheck(!props.checked);
      }}
      dense
    >
      <ListItemIcon>
        <Checkbox
          color="default"
          className={classes.root}
          checked={props.checked}
          edge="start"
        />
      </ListItemIcon>
      <ListItemText primary={props.primary} secondary={props.secondary} />
    </ListItem>
  );
};
