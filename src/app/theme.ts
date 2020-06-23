import { createMuiTheme } from "@material-ui/core";
import { PaletteOptions } from "@material-ui/core/styles/createPalette";
import { red } from "@material-ui/core/colors";

export const themeFactory = (darkMode: boolean = false) =>
  createMuiTheme({
    palette: darkMode ? darkOptions : lightOptions,
  });

const lightOptions: PaletteOptions = {
  type: "light",
  primary: red,
  secondary: red,
};

const darkOptions: PaletteOptions = {
  type: "dark",
  primary: red,
  secondary: red,
};
