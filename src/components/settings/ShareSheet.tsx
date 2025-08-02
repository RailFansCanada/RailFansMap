import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Snackbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Close, ContentCopy } from "@mui/icons-material";
import React from "react";
import { useAppState } from "../../hooks/useAppState";

const ShareCheckbox = styled(Checkbox)`
  color: ${({ theme }) => theme.palette.text.primary};
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  right: ${({ theme }) => theme.spacing(1)};
  top: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.palette.grey[500]};
`;

const ShareDialogContent = styled(DialogContent)`
  list-style: none;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(1, 0)};
`;

const ShareButton = styled(Button)`
  text-transform: none;
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  background: ${({ theme }) => theme.palette.background.default};
  margin: ${({ theme }) => theme.spacing(0, 3, 2, 3)};
  max-width: 100%;

  &:hover {
    background: ${({ theme }) => theme.palette.background.default};
  }
`;

const ShareButtonText = styled('span')`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ShareOption = (props: {
  primary: string;
  secondary?: string;
  checked: boolean;
  onCheck: (checked: boolean) => void;
}) => {
  const handleChange = () => {
    props.onCheck(!props.checked);
  };
  return (
    <ListItem button onClick={handleChange} dense>
      <ListItemText primary={props.primary} secondary={props.secondary} />
      <ListItemSecondaryAction>
        <ShareCheckbox
          color="primary"
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
  } = useAppState();

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
          <CloseButton onClick={handleClose} size="large">
            <Close />
          </CloseButton>
        </DialogTitle>
        <ShareDialogContent>
          <ShareButton onClick={handleShare} endIcon={<ContentCopy />}>
            <ShareButtonText>{getShareUrl()}</ShareButtonText>
          </ShareButton>
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
        </ShareDialogContent>
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
