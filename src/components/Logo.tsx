import React from "react";
import { AppTheme, State } from "../redux";
import { useIsDarkTheme } from "../app/utils";
import { Theme, makeStyles } from "@material-ui/core";

import logoLight from "../images/logoLight.svg";
import logoDark from "../images/logoDark.svg";
import { connect } from "react-redux";

interface LogoProps {
  readonly appTheme: AppTheme;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "fixed",
    width: 88,
    bottom: theme.spacing(2),
    left: "calc(50% - 44px)",
  },
}));

const LogoComponent = (props: LogoProps) => {
  const classes = useStyles();
  const isDarkTheme = useIsDarkTheme(props.appTheme);

  return (
    <a href="https://otrainfans.ca">
      <img src={isDarkTheme ? logoLight : logoDark} className={classes.root} />
    </a>
  );
};

const mapStateToProps = (state: State) => ({
  appTheme: state.appTheme,
});

export const Logo = connect(mapStateToProps)(LogoComponent);
