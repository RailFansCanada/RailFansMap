import * as React from "react";
import { Card, CardActions, Collapse, IconButton } from "@material-ui/core";

export const Controls = () => {

  const [expanded, setExpanded] = React.useState(false);

  return <Card>
    <CardActions>
      <IconButton>
      </IconButton>
    </CardActions>
    <Collapse in={expanded} timeout="auto" unmountOnExit>
    </Collapse>
  </Card>;
};
