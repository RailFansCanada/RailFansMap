import { createTheme } from "@mui/material";
import { PaletteOptions } from '@mui/material/styles';

export const themeFactory = (darkMode: boolean = false) =>
  createTheme({
    palette: darkMode ? darkOptions : lightOptions,
  });

const lightOptions: PaletteOptions = {
  mode: "light",
  primary: {
    main: "#cc0000",
  },
  secondary: {
    main: "#cc0000",
  },
};

const darkOptions: PaletteOptions = {
  mode: "dark",
  primary: {
    main: "#ff4f30",
  },
  secondary: {
    main: "#ff4f30",
  },
};
