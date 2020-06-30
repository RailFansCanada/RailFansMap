import { createMuiTheme } from "@material-ui/core";
import { PaletteOptions } from "@material-ui/core/styles/createPalette";

export const themeFactory = (darkMode: boolean = false) =>
  createMuiTheme({
    palette: darkMode ? darkOptions : lightOptions,
  });

const lightOptions: PaletteOptions = {
  type: "light",
  primary: {
    main: "#cc0000",
  },
  secondary: {
    main: "#cc0000",
  },
};

const darkOptions: PaletteOptions = {
  type: "dark",
  primary: {
    main: "#ff4f30",
  },
  secondary: {
    main: "#ff4f30",
  },
};
