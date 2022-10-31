import styled from "styled-components";
import { Paper } from "@mui/material";

export const ControlPaper = styled(Paper)`
  margin: ${({ theme }) => theme.spacing(0.5)} 0;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;
