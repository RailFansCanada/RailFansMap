import React from "react";
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Menu,
  MenuItem,
} from "@mui/material";

export interface SwitchOptionProps {
  readonly primary: string;
  readonly secondary?: string;
  disabled?: boolean;
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
}

export const SwitchOption = (props: SwitchOptionProps) => {
  const handleToggle = () => {
    props.onToggle(!props.checked);
  };

  return (
    <ListItem disabled={props.disabled} onClick={handleToggle} button>
      <ListItemText primary={props.primary} secondary={props.secondary} />
      <ListItemSecondaryAction>
        <Switch disabled={props.disabled} onChange={handleToggle} checked={props.checked} edge="end" />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export interface MenuOptionProps {
  readonly primary: string;
  options: string[];
  value: number;
  onChange?: (value: number) => void;
}

export const MenuOption = (props: MenuOptionProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (index: number) => {
    props?.onChange(index);
    setAnchorEl(null);
  };

  return (
    <>
      <ListItem onClick={handleClick} button>
        <ListItemText
          primary={props.primary}
          secondary={props.options[props.value]}
        />
      </ListItem>
      <Menu open={anchorEl != null} anchorEl={anchorEl}>
        {props.options.map((value, index) => (
          <MenuItem
            key={value}
            onClick={() => handleClose(index)}
            selected={props.value === index}
          >
            {value}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
