import * as React from "react";
import {
  Collapse,
  IconButton,
  makeStyles,
  Theme,
  Paper,
  Tooltip,
} from "@material-ui/core";
import { ExpandMore, Settings, Layers, Share } from "@material-ui/icons";
import { setDrawerOpen, setShareSheetOpen } from "../../redux";
import { connect } from "react-redux";
import { ShareSheet } from "./ShareSheet";

interface ControlsProps {
  readonly setDrawerOpen: typeof setDrawerOpen;
  readonly setShareSheetOpen: typeof setShareSheetOpen;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "fixed",
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  share: {
    marginTop: theme.spacing(1),
  },
}));

const ControlsComponent = (props: ControlsProps) => {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  return (
    <>
      <div className={classes.root}>
        <Paper>
          <Tooltip title="Map Settings">
            <IconButton onClick={() => props.setDrawerOpen(true)}>
              <Layers />
            </IconButton>
          </Tooltip>
        </Paper>
        <Paper className={classes.share}>
          <Tooltip title="Share">
            <IconButton onClick={() => props.setShareSheetOpen(true)}>
              <Share />
            </IconButton>
          </Tooltip>
        </Paper>
      </div>
      <ShareSheet />
    </>
  );
};

const mapDispatchToProps = {
  setDrawerOpen,
  setShareSheetOpen,
};

export const Controls = connect(null, mapDispatchToProps)(ControlsComponent);
