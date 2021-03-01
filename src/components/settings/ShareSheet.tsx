import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Grow,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Paper,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { Close, ContentCopy } from "@material-ui/icons";
import React from "react";
import { connect } from "react-redux";
import { setShareSheetOpen, State } from "../../redux";

export interface ShareSheetProps {
  readonly shareSheetOpen: boolean;
  readonly setShareSheetOpen: typeof setShareSheetOpen;
  readonly state: State;
}

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  shareButton: {
    textTransform: "none",
    fontSize: theme.typography.body1.fontSize,
    background: theme.palette.background.default,

    "&:hover": {
      background: theme.palette.background.default,
    },
    margin: theme.spacing(0, 3, 2, 3),
    maxWidth: "100%",
  },
  dialogContent: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(1, 0),
  },
  buttonText: {
    width: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}));

const useCheckboxStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.text.primary,
  },
}));

const ShareOption = (props: {
  primary: string;
  secondary?: string;
  checked: boolean;
  onCheck: (checked: boolean) => void;
}) => {
  const classes = useCheckboxStyles();
  const handleChange = () => {
    props.onCheck(!props.checked);
  };
  return (
    <ListItem button onClick={handleChange} dense>
      <ListItemText primary={props.primary} secondary={props.secondary} />
      <ListItemSecondaryAction>
        <Checkbox
          color="primary"
          className={classes.root}
          checked={props.checked}
          edge="start"
          onChange={handleChange}
        />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const ShareSheetComponent = (props: ShareSheetProps) => {
  const classes = useStyles();
  const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(
    null
  );

  const [useLocation, setUseLocation] = React.useState(true);
  const [useMap, setUseMap] = React.useState(false);
  const [useTheme, setUseTheme] = React.useState(false);
  const [useKanata, setUseKanata] = React.useState(
    props.state.lines.kanataExtension
  );
  const [useBarrhaven, setUseBarrhaven] = React.useState(
    props.state.lines.barrhavenExtension
  );

  React.useEffect(() => {
    setUseKanata(props.state.lines.kanataExtension);
    setUseBarrhaven(props.state.lines.barrhavenExtension);
  }, [props.state.lines]);

  const prefersDarkScheme = useMediaQuery("(prefers-color-scheme: dark)");
  const isDarkMode =
    (props.state.appTheme === "system" && prefersDarkScheme) ||
    props.state.appTheme === "dark";

  const handleClose = () => {
    props.setShareSheetOpen(false);
  };

  const getShareUrl = () => {
    const protocol = location.protocol;
    const host = location.host;
    const url = new URL(`${protocol}//${host}/`);

    if (useLocation) {
      url.hash = location.hash;
    }

    if (useMap) {
      url.searchParams.append("map", props.state.mapStyle);
    }

    if (useTheme) {
      url.searchParams.append("theme", isDarkMode ? "dark" : "light");
    }

    if (useKanata) {
      url.searchParams.append("kanata", "true");
    }

    if (useBarrhaven) {
      url.searchParams.append("barrhaven", "true");
    }

    return url.toString();
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setSnackbarMessage("Copied to clipboard");
      })
      .catch(() => {
        setSnackbarMessage("Could not copy to clipboard");
      });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "O-Train Map",
        url: getShareUrl(),
      });
    } else if (navigator.clipboard.writeText) {
      copyToClipboard(getShareUrl());
    }
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={handleClose}
        open={props.shareSheetOpen ?? false}
      >
        <DialogTitle disableTypography>
          <Typography variant="h6">Share Map</Typography>
          <IconButton className={classes.closeButton} onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Button
            className={classes.shareButton}
            onClick={handleShare}
            endIcon={<ContentCopy />}
          >
            <span className={classes.buttonText}>{getShareUrl()}</span>
          </Button>
          <ShareOption
            primary="Current Location"
            secondary="Share the map at the current location"
            checked={useLocation}
            onCheck={(checked) => setUseLocation(checked)}
          />
          <ShareOption
            primary="Current Map"
            secondary={`Share the map using the ${props.state.mapStyle} base map`}
            checked={useMap}
            onCheck={(checked) => setUseMap(checked)}
          />
          <ShareOption
            primary="Show Kanata Extension"
            secondary="Show the Stage 3 Kanata extension on the shared map"
            checked={useKanata}
            onCheck={(checked) => setUseKanata(checked)}
          />
          <ShareOption
            primary="Show Barrhaven Extension"
            secondary="Show the Stage 3 Barrhaven extension on the shared map"
            checked={useBarrhaven}
            onCheck={(checked) => setUseBarrhaven(checked)}
          />
          {/* <ShareOption
            primary="Current Theme"
            secondary={`Share the map with the ${
              isDarkMode ? "dark" : "light"
            } theme applied`}
            checked={useTheme}
            onCheck={() => setUseTheme(!useTheme)}
          /> */}
        </DialogContent>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={snackbarMessage != null}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
        autoHideDuration={2400}
      />
    </>
  );
};

const mapStateToProps = (state: State) => ({
  shareSheetOpen: state.shareSheetOpen,
  state,
});

const mapDispatchToProps = {
  setShareSheetOpen,
};

export const ShareSheet = connect(
  mapStateToProps,
  mapDispatchToProps
)(ShareSheetComponent);
