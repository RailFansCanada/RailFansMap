import * as React from "react";
import {
  Card,
  CardActions,
  Collapse,
  IconButton,
  makeStyles,
  Theme,
  Paper,
} from "@material-ui/core";
import { ExpandMore, Settings, Layers } from "@material-ui/icons";
import { setDrawerOpen } from "../../redux";
import { connect } from "react-redux";

interface ControlsProps {
  readonly setDrawerOpen: typeof setDrawerOpen;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "fixed",
    right: theme.spacing(2),
    top: theme.spacing(2),
  },
}));

const ControlsComponent = (props: ControlsProps) => {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Paper className={classes.root}>
      <IconButton onClick={() => props.setDrawerOpen(true)}>
        <Layers />
      </IconButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit></Collapse>
    </Paper>
  );
};

const mapDispatchToProps = {
  setDrawerOpen,
};

export const Controls = connect(null, mapDispatchToProps)(ControlsComponent);
