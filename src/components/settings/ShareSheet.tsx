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
  Paper,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Close, ContentCopy } from "@mui/icons-material";
import React from "react";
import { useAppState } from "../../hooks/useAppState";

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

export const ShareSheet = () => {
  const {
    shareSheetOpen,
    setShareSheetOpen,
    lineFilterState,
    appTheme,
    mapStyle,
  } = useAppState();
  const classes = useStyles();
  const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(
    null
  );

  const [useLocation, setUseLocation] = React.useState(true);
  const [useMap, setUseMap] = React.useState(false);
  const [useTheme, setUseTheme] = React.useState(false);
  const [useKanata, setUseKanata] = React.useState(
    lineFilterState["kanataExtension"]
  );
  const [useBarrhaven, setUseBarrhaven] = React.useState(
    lineFilterState["barrhavenExtension"]
  );
  const [useGatineau, setUseGatineau] = React.useState(
    lineFilterState["gatineauLrt"]
  );

  React.useEffect(() => {
    setUseKanata(lineFilterState["kanataExtension"]);
    setUseBarrhaven(lineFilterState["barrhavenExtension"]);
  }, [lineFilterState]);

  const prefersDarkScheme = useMediaQuery("(prefers-color-scheme: dark)");
  const isDarkMode =
    (appTheme === "system" && prefersDarkScheme) || appTheme === "dark";

  const handleClose = () => {
    setShareSheetOpen(false);
  };

  const getShareUrl = () => {
    const protocol = location.protocol;
    const host = location.host;
    const url = new URL(`${protocol}//${host}/`);

    if (useLocation) {
      url.hash = location.hash;
    }

    if (useMap) {
      url.searchParams.append("map", mapStyle);
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

    if (useGatineau) {
      url.searchParams.append("gatineau", "true");
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
        open={shareSheetOpen}
      >
        <DialogTitle>
          <Typography variant="h6">Share Map</Typography>
          <IconButton
            className={classes.closeButton}
            onClick={handleClose}
            size="large"
          >
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
            secondary={`Share the map using the ${mapStyle} base map`}
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
          <ShareOption
            primary="Show Gatineau Tramway"
            secondary="Show the proposed Gatineau Tramway on the shared map"
            checked={useGatineau}
            onCheck={(checked) => setUseGatineau(checked)}
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
