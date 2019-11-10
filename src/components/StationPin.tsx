import * as React from "react";

const style = {
  fill: "#ffffff",
  stroke: "#000000",
  "stroke-width": 2
};

export default class StationPin extends React.PureComponent<{
  size: number;
  onClick: React.MouseEvent<SVGSVGElement, MouseEvent>;
}> {
  render() {
    const { size = 20, onClick } = this.props;
    return (
      <svg height={size} viewBox="0 0 24 24">
        <circle style={style} cx="12" cy="12" r="12" />
      </svg>
    );
  }
}
