import { styled } from "@mui/material/styles";
import { Paper } from "@mui/material";

export const ControlPaper = styled(Paper)`
  margin: ${({ theme }) => theme.spacing(0.5)} 0;

  &:first-of-type {
    margin-top: 0;
  }

  &:last-of-type {
    margin-bottom: 0;
  }
`;
