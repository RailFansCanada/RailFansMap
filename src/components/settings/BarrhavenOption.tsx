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
  Collapse,
  List,
  ListItemText,
  ListItem,
  ListItemIcon,
  Checkbox,
  Divider,
} from "@material-ui/core";
import clsx from "clsx";

import image from "../../images/confederation.svg";
import {
  State,
  Alternatives,
  enableAlternative,
  disableAlternative,
} from "../../redux";
import { connect } from "react-redux";

export interface BarrhavenOptionProps {
  readonly primary: string;
  readonly secondary?: string;

  readonly selected?: boolean;
  readonly onClick?: () => void;

  readonly imageUrl?: string;
  readonly tint?: string;

  readonly alternatives: Alternatives[];
  readonly enableAlternative: typeof enableAlternative;
  readonly disableAlternative: typeof disableAlternative;
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
    backgroundColor: (props: any) => fade(props.tint, 0.1),
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

export const BarrhavenOptionComponent = (props: BarrhavenOptionProps) => {
  const theme = useTheme();
  const classes = useStyles({
    tint: props.tint ?? theme.palette.secondary.main,
  });

  const setAlternative = (value: boolean, alternative: Alternatives) => {
    if (value) {
      props.enableAlternative(alternative);
    } else {
      props.disableAlternative(alternative);
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
        </CardContent>
      </CardActionArea>
      <Collapse in={props.selected}>
        <Divider />
        <List>
          <AlternativeItem
            primary="Alternative 1"
            secondary="Cut and Cover Tunnel in Woodroffe Avenue Corridor"
            checked={props.alternatives.includes("1")}
            onCheck={(checked) => {
              setAlternative(checked, "1");
            }}
          />
          <AlternativeItem
            primary="Alternative 2"
            secondary="Trench in Woodroffe Avenue Corridor"
            checked={props.alternatives.includes("2")}
            onCheck={(checked) => {
              setAlternative(checked, "2");
            }}
          />
          <AlternativeItem
            primary="Alternative 3"
            secondary="Elevated in Woodroffe Avenue Corridor (Median)"
            checked={props.alternatives.includes("3")}
            onCheck={(checked) => {
              setAlternative(checked, "3");
            }}
          />
          <AlternativeItem
            primary="Alternative 3A"
            secondary="West Hunt Club Station on East side of Woodroffe Avenue"
            checked={props.alternatives.includes("A")}
            onCheck={(checked) => {
              setAlternative(checked, "A");
            }}
          />
          <AlternativeItem
            primary="Alternative 4"
            secondary="Elevated in Woodroffe Avenue Corridor (West Side)"
            checked={props.alternatives.includes("4")}
            onCheck={(checked) => {
              setAlternative(checked, "4");
            }}
          />
          <AlternativeItem
            primary="Alternative 5"
            secondary="Trench West of Woodroffe Avenue"
            checked={props.alternatives.includes("5")}
            onCheck={(checked) => {
              setAlternative(checked, "5");
            }}
          />
          <AlternativeItem
            primary="Alternative 6"
            secondary="Elevated West of Woodroffe Avenue"
            checked={props.alternatives.includes("6")}
            onCheck={(checked) => {
              setAlternative(checked, "6");
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
    "&$checked": {
      color: theme.palette.text.primary,
    },
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

const mapStateToProps = (state: State) => ({
  alternatives: state.barrhavenAlternatives,
});

const mapDispatchToProps = {
  enableAlternative,
  disableAlternative,
};

export const BarrhavenOption = connect(
  mapStateToProps,
  mapDispatchToProps
)(BarrhavenOptionComponent);
