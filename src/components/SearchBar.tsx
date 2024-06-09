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
import styled from "@emotion/styled";
import {
  BoundsResult,
  search,
  SearchResult,
  StationResult,
} from "../app/search";
import { useData2 } from "../hooks/useData";
import buffer from "@turf/buffer";
import bbox from "@turf/bbox";
import { Point } from "geojson";
import { SimpleBBox, useMapTarget } from "../hooks/useMapTarget";
import { useAppState } from "../hooks/useAppState";
import { isLineEnabled } from "../app/utils";
import { useWindow } from "../hooks/useWindow";
import { useStrings } from "../hooks/useStrings";

const SearchContainer = styled.div`
  position: fixed;
  padding: ${({ theme }) => theme.spacing(1)};
  width: 400px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  z-index: 10;

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const SearchBarPaper = styled(Paper)<{ selected: boolean }>`
  padding: ${({ theme }) => theme.spacing(0.25)};
  width: ${(props) => (props.selected ? "100%" : "48px")};
  transition: ${({ theme }) => theme.transitions.create(["width", "padding"])};
  overflow: clip;
  display: flex;
  box-sizing: border-box;
`;

const SearchInput = styled(InputBase)`
  flex-grow: 1;
  margin-left: ${({ theme }) => theme.spacing(0.25)};
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

type SearchProps = {
  query: string;
  onQueryUpdate(query: string): void;
};

const MobileSearch = (props: SearchProps) => {
  const { searchOpen, setSearchOpen } = useAppState();
  const strings = useStrings();

  return (
    <SearchBarPaper selected={searchOpen}>
      <SearchButton
        aria-label="Search Button"
        onClick={() => setSearchOpen(!searchOpen)}
      >
        <Search />
      </SearchButton>
      <SearchInput
        onChange={(e) => {
          props.onQueryUpdate(e.target.value);
        }}
        value={props.query}
        placeholder={strings.search_placeholder}
      />
      {searchOpen && (
        <SearchButton
          aria-label="Close Search"
          onClick={() => {
            props.onQueryUpdate("");
            setSearchOpen(false);
          }}
        >
          <Close />
        </SearchButton>
      )}
    </SearchBarPaper>
  );
};

const DesktopSearch = (props: SearchProps) => {
  const { searchOpen, setSearchOpen } = useAppState();
  const strings = useStrings();

  return (
    <SearchBarPaper selected>
      <SearchButton aria-label="Search Button">
        <Search />
      </SearchButton>
      <SearchInput
        onChange={(e) => {
          props.onQueryUpdate(e.target.value);
        }}
        value={props.query}
        placeholder={strings.search_placeholder}
      />
      {searchOpen && (
        <SearchButton
          aria-label="Close Search"
          onClick={() => {
            props.onQueryUpdate("");
            setSearchOpen(false);
          }}
        >
          <Close />
        </SearchButton>
      )}
    </SearchBarPaper>
  );
};

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const { db, lines } = useData2();
  const [results, setResults] = useState<SearchResult[]>([]);
  const { searchOpen, setSearchOpen } = useAppState();
  const [width] = useWindow();

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

    if (width <= 600) {
      setSearchOpen(false);
    }
  };

  const handleBoundClick = (result: BoundsResult) => {
    // Enable the line if it's being filtered
    const filterKey = lines[result.id].filterKey;
    if (filterKey && !isLineEnabled(filterKey, lineFilterState)) {
      setLineFiltered(filterKey, true);
    }

    setTarget(result.bounds as SimpleBBox);

    if (width <= 600) {
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    if (query == "") {
      return;
    }

    search(db, query).then((r) => {
      if (r.length > 0) {
        setSearchOpen(true);
      }
      setResults(r);
    });
  }, [query]);

  return (
    <SearchContainer>
      {width > 600 ? (
        <DesktopSearch query={query} onQueryUpdate={setQuery} />
      ) : (
        <MobileSearch query={query} onQueryUpdate={setQuery} />
      )}
      <Grow
        in={searchOpen}
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
