import { createMuiTheme } from "@material-ui/core";
import { PaletteOptions } from "@material-ui/core/styles/createPalette";

export const themeFactory = (darkMode: boolean = false) =>
  createMuiTheme({
    palette: darkMode ? darkOptions : lightOptions,
  });

const lightOptions: PaletteOptions = {
  type: "light",
};

const darkOptions: PaletteOptions = {
  type: "dark",
};