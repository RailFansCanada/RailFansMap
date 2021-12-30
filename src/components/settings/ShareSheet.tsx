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

  const [withLocation, setWithLocation] = React.useState(true);
  const [withSatellite, setWithSatellite] = React.useState(false);
  const [withToggledLines, setWithToggledLines] = React.useState(false);

  const handleClose = () => {
    setShareSheetOpen(false);
  };

  const getShareUrl = () => {
    const protocol = location.protocol;
    const host = location.host;
    const url = new URL(`${protocol}//${host}/`);

    if (withLocation) {
      url.hash = location.hash;
    }

    if (withSatellite) {
      url.searchParams.append("map", "satellite");
    }

    if (withToggledLines) {
      const lines = Object.keys(lineFilterState)
        .filter((key) => lineFilterState[key])
        .map((key) => key)
        .join(",");
      url.searchParams.append("show", lines);
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
        title: "Rail Fans Map",
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
          <Typography variant="h6">Share This Map</Typography>
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
            secondary="Share the map with the current location visible"
            checked={withLocation}
            onCheck={(checked) => setWithLocation(checked)}
          />
          <ShareOption
            primary="Satellite Basemap"
            secondary={`Share the map using the satellite basemap`}
            checked={withSatellite}
            onCheck={(checked) => setWithSatellite(checked)}
          />
          <ShareOption
            primary="Include Toggled Lines"
            secondary="Show all lines that have been toggled in the legend"
            checked={withToggledLines}
            onCheck={(checked) => setWithToggledLines(checked)}
          />
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
