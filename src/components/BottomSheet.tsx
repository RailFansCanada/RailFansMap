import React, { useEffect, useState } from "react";
import { ButtonBase, Paper, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { Chevron } from "./Chevron";
import { useAppState } from "../hooks/useAppState";

const BottomSheetSurface = styled(Paper)`
  position: absolute;
  width: 40vw;
  min-width: 500px;
  left: ${({ theme }) => theme.spacing(1)};
  bottom: 0;
  z-index: 50;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
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
};

const BottomSheetHeader = (props: BottomSheetHeaderProps) => {
  return (
    <HeaderContainer>
      <Typography>
        On the Map{props.regionName && ` • ${props.regionName}`}
      </Typography>
      <Chevron down={true} />
    </HeaderContainer>
  );
};

export const BottomSheet = () => {
  const { visibleRegions } = useAppState();
  const [targetRegion, setTargetRegion] = useState<string | null>(null);

  useEffect(() => {
    const tier1 = [];
    const tier2 = [];

    for (const region of visibleRegions) {
      if (region.tier === 1) {
        tier1.push(region);
      } else if (region.tier === 2) {
        tier2.push(region);
      }
    }

    if (tier2.length === 1) {
      setTargetRegion(tier2[0].title);
    } else {
      setTargetRegion(tier1[0]?.title);
    }
  }, [visibleRegions]);

  return (
    <BottomSheetSurface>
      <BottomSheetHeader regionName={targetRegion} />
    </BottomSheetSurface>
  );
};
