import {
  Build,
  Close,
  FilterList,
  LocationOn,
  Search,
  Train,
} from "@mui/icons-material";
import {
  Grow,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  BoundsResult,
  search,
  SearchResult,
  StationResult,
} from "../app/search";
import { useData2 } from "../hooks/useData";
import buffer from "@turf/buffer";
import bbox from "@turf/bbox";
import { BBox, Point } from "geojson";
import { SimpleBBox, useMapTarget } from "../hooks/useMapTarget";
import { useAppState } from "../hooks/useAppState";
import { isLineEnabled } from "../app/utils";

const SearchContainer = styled.div`
  position: fixed;
  padding: ${({ theme }) => theme.spacing(1)};
  width: 400px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  @media (max-width: 600px) {
    width: calc(100% - 56px);
  }
`;

const SearchBarPaper = styled(Paper)`
  padding: ${({ theme }) => theme.spacing(0.25, 1)};
  width: 100%;
  display: flex;
  box-sizing: border-box;
`;

const SearchInput = styled(InputBase)`
  flex-grow: 1;
  & input:placeholder-shown {
    text-overflow: ellipsis;
  }
`;

const SearchButton = styled(IconButton)`
  padding: 10px;
`;

const ResultsPaper = styled(Paper)`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const ResultLineIcon = styled.img`
  height: 24px;
  width: 24px;
`;

const ResultLineIconContainer = styled(ListItemIcon)`
  justify-content: end;
`;

const NoResultsItem = styled(ListItem)`
  user-select: none;
`;

const StationResultItem = (
  props: StationResult & { onClick(result: StationResult): void }
) => {
  const { lines } = useData2();

  return (
    <ListItem disablePadding dense>
      <ListItemButton onClick={() => props.onClick(props)}>
        <ListItemIcon>
          <LocationOn />
        </ListItemIcon>
        <ListItemText primary={props.name} secondary={props.description} />
        <ResultLineIconContainer>
          {props.lines
            .filter((icon) => lines[icon])
            .map((icon) => (
              <ResultLineIcon key={icon} src={`icons/${lines[icon].icon}`} />
            ))}
        </ResultLineIconContainer>
      </ListItemButton>
    </ListItem>
  );
};

const LineResultItem = (
  props: BoundsResult & { onClick(result: BoundsResult): void }
) => {
  const { lines } = useData2();

  return (
    <ListItem disablePadding dense>
      <ListItemButton onClick={() => props.onClick(props)}>
        <ListItemIcon>
          {props.type === "rail-yard" ? <Build /> : <Train />}
        </ListItemIcon>
        <ListItemText primary={props.name} secondary={props.description} />
        {lines[props.id].icon && (
          <ResultLineIconContainer>
            <ResultLineIcon src={`icons/${lines[props.id].icon}`} />
          </ResultLineIconContainer>
        )}
      </ListItemButton>
    </ListItem>
  );
};

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const { db, lines } = useData2();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { lineFilterState, setLineFiltered } = useAppState();

  const { setTarget } = useMapTarget();

  const handleResultClick = (result: StationResult) => {
    // Enable the line if it's being filtered
    const filterKey = lines[result.parent].filterKey;
    if (filterKey && !isLineEnabled(filterKey, lineFilterState)) {
      setLineFiltered(filterKey, true);
    }

    const point: Point = {
      type: "Point",
      coordinates: [result.lng, result.lat],
    };
    const buffered = buffer(point, 0.5, { units: "kilometers" });
    const targetBbox = bbox(buffered);

    setTarget(targetBbox as SimpleBBox);
  };

  const handleBoundClick = (result: BoundsResult) => {
    // Enable the line if it's being filtered
    const filterKey = lines[result.id].filterKey;
    if (filterKey && !isLineEnabled(filterKey, lineFilterState)) {
      setLineFiltered(filterKey, true);
    }

    setTarget(result.bounds as SimpleBBox);
  };

  useEffect(() => {
    if (query == "") {
      return;
    }

    search(db, query).then((r) => {
      if (r.length > 0) {
        setShowResults(true);
      }
      setResults(r);
    });
  }, [query]);

  return (
    <SearchContainer>
      <SearchBarPaper>
        <SearchButton>
          <Search />
        </SearchButton>
        <SearchInput
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          value={query}
          placeholder="Search stations, lines, yards..."
        />
        <SearchButton
          onClick={() => {
            setQuery("");
            setShowResults(false);
          }}
        >
          <Close />
        </SearchButton>
      </SearchBarPaper>
      <Grow
        in={showResults}
        style={{ transformOrigin: "50% 0 0" }}
        unmountOnExit
      >
        <ResultsPaper>
          <List>
            {results.length === 0 && (
              <NoResultsItem disabled>
                <ListItemIcon>
                  <FilterList />
                </ListItemIcon>
                <ListItemText primary="No results..." />
              </NoResultsItem>
            )}
            {results.slice(0, 10).map((result, i) => {
              if (result.type === "station") {
                return (
                  <StationResultItem
                    key={i}
                    {...(result as StationResult)}
                    onClick={handleResultClick}
                  />
                );
              } else {
                return (
                  <LineResultItem
                    key={i}
                    {...(result as BoundsResult)}
                    onClick={handleBoundClick}
                  />
                );
              }
            })}
          </List>
        </ResultsPaper>
      </Grow>
    </SearchContainer>
  );
};
