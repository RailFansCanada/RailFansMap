import React, { useContext, useEffect, useState } from "react";
import { ButtonBase, Paper, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { Chevron } from "./Chevron";
import { MapBoundsContext } from "../contexts/MapBoundsContext";

const BottomSheetSurface = styled(Paper)`
  position: absolute;
  width: 40vw;
  min-width: 500px;
  left: ${({ theme }) => theme.spacing(1)};
  bottom: 0;
  z-index: 50;
  border-radius: 16px 16px 0 0;
  overflow: hidden;

  @media (max-width: 600px) {
    min-width: 0;
    width: 100%;
    left: 0;
  }
`;

const HeaderContainer = styled(ButtonBase)`
  height: ${({ theme }) => theme.spacing(7)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(0, 2)};
  display: flex;
  box-sizing: border-box;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

type BottomSheetHeaderProps = {
  regionName?: string | null;
  expanded: boolean;
  onClick: () => void;
};

const BottomSheetHeader = (props: BottomSheetHeaderProps) => {
  return (
    <HeaderContainer onClick={props.onClick}>
      <Typography>
        On the Map{props.regionName && ` • ${props.regionName}`}
      </Typography>
      <Chevron down={!props.expanded} />
    </HeaderContainer>
  );
};

export const BottomSheet = () => {
  const visibleRegions = useContext(MapBoundsContext);
  const [targetRegion, setTargetRegion] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    const { tier1, tier2 } = visibleRegions;

    if (tier2.length === 1) {
      setTargetRegion(tier2[0].title);
    } else {
      setTargetRegion(tier1[0]?.title);
    }
  }, [visibleRegions]);

  return (
    <BottomSheetSurface>
      <BottomSheetHeader
        expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        regionName={targetRegion}
      />
    </BottomSheetSurface>
  );
};
