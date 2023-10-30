import React, { useContext, useEffect, useState } from "react";
import {
  ButtonBase,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import styled from "@emotion/styled";
import { Chevron } from "./Chevron";
import { MapBoundsContext } from "../contexts/MapBoundsContext";
import { config, Agency } from "../config";
import metadata from "../../build/metadata.json";
import { LoadedMetadata } from "../hooks/useData";
import Scrollbars from "react-custom-scrollbars";
import { AgencySection } from "./AgencySection";

const agencyMap: { [key: string]: Agency } = {};
config.agencies.forEach((agency) => {
  agencyMap[agency.id] = agency;
});

const metadataMap: { [key: string]: LoadedMetadata[] } = {};

Object.values(metadata as unknown as { [key: string]: LoadedMetadata }).forEach(
  (line) => {
    const agency = line.agency;
    if (metadataMap[agency] == null) {
      metadataMap[agency] = [];
    }

    if (line.type === "rail-line" || line.type === "streetcar-line")
      metadataMap[agency].push(line);
  }
);

const BottomSheetSurface = styled(Paper)<{ open: boolean }>`
  position: fixed;
  width: 35vw;
  min-width: 500px;
  left: ${({ theme }) => theme.spacing(1)};
  bottom: ${({ open }) => (open ? 0 : "-50vh")};
  z-index: 50;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  box-sizing: border-box;
  transition: ${({ theme }) => theme.transitions.create("bottom")};

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

const ContentContainer = styled.div`
  height: 50vh;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(0)};
  display: flex;
  box-sizing: border-box;
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

  const [tierAgencies, setTierAgencies] = useState<Agency[]>([]);

  useEffect(() => {
    const { tier1, tier2 } = visibleRegions;

    if (tier2.length === 1) {
      setTargetRegion(tier2[0].title);
      setTierAgencies(tier2[0].agencies.map((a) => agencyMap[a]));
    } else {
      setTargetRegion(tier1[0]?.title);
      setTierAgencies(tier1[0]?.agencies.map((a) => agencyMap[a]) ?? []);
    }
  }, [visibleRegions]);

  return (
    <BottomSheetSurface elevation={open ? 2 : 0} open={expanded}>
      <BottomSheetHeader
        expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        regionName={targetRegion}
      />
      <ContentContainer>
        <Scrollbars>
          {tierAgencies.map((agency) => (
            <AgencySection
              key={agency.id}
              agency={agency}
              metadata={metadataMap[agency.id]}
            />
          ))}
        </Scrollbars>
      </ContentContainer>
    </BottomSheetSurface>
  );
};
