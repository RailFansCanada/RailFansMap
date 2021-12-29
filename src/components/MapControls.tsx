import * as React from "react";
import { Theme, Fab, useTheme, emphasize } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { connect } from "react-redux";
import { zoomIn, zoomOut } from "../redux";

interface MapControlsProps {
  readonly zoomIn: typeof zoomIn;
  readonly zoomOut: typeof zoomOut;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "fixed",
    right: theme.spacing(1),
    bottom: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
  },
  button: {
    margin: theme.spacing(0.5, 0),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    "&:hover": {
      background: emphasize(theme.palette.background.paper),
    },
  },
}));

const MapControlsComponent = (props: MapControlsProps) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Fab className={classes.button} size="small" onClick={props.zoomIn}>
        <AddIcon />
      </Fab>
      <Fab className={classes.button} size="small" onClick={props.zoomOut}>
        <RemoveIcon />
      </Fab>
    </div>
  );
};

const mapDispatchToProps = {
  zoomIn,
  zoomOut,
};

export const MapControls = connect(
  null,
  mapDispatchToProps
)(MapControlsComponent);
