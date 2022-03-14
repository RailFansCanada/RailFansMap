import { Close, LocationOn, Search } from "@mui/icons-material";
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
import { searchStations, Station } from "../app/search";
import { useData } from "../hooks/useData";
import buffer from "@turf/buffer";
import bbox from "@turf/bbox";
import { Feature, Point } from "geojson";
import { SimpleBBox, useMapTarget } from "../hooks/useMapTarget";

const SearchContainer = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing(1)};
  left: ${({ theme }) => theme.spacing(1)};
  width: 400px;
  display: flex;
  flex-direction: column;
`;

const SearchBarPaper = styled(Paper)`
  padding: ${({ theme }) => theme.spacing(0.25, 1)};
  width: 100%;
  display: flex;
  box-sizing: border-box;
`;

const SearchInput = styled(InputBase)`
  flex-grow: 1;
`;

const SearchButton = styled(IconButton)`
  padding: 10px;
`;

const ResultsPaper = styled(Paper)`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const { db } = useData();
  const [results, setResults] = useState<Station[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { setTarget } = useMapTarget();

  const handleResultClick = (lng: number, lat: number) => {
    const point: Point = { type: "Point", coordinates: [lng, lat] };
    const buffered = buffer(point, 0.5, { units: "kilometers" });
    const targetBbox = bbox(buffered);

    setTarget(targetBbox as SimpleBBox);
  };

  useEffect(() => {
    if (query == "") {
      return;
    }

    searchStations(db, query).then((r) => {
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
          placeholder="Search stations by name..."
        />
        {query !== "" && (
          <SearchButton
            onClick={() => {
              setQuery("");
              setShowResults(false);
            }}
          >
            <Close />
          </SearchButton>
        )}
      </SearchBarPaper>
      <Grow in={showResults} style={{ transformOrigin: "50% 0 0" }}>
        <ResultsPaper>
          <List>
            {results.map((result, i) => (
              <ListItem key={i} disablePadding>
                <ListItemButton
                  onClick={() => handleResultClick(result.lng, result.lat)}
                >
                  <ListItemIcon>
                    <LocationOn color="disabled" />
                  </ListItemIcon>
                  <ListItemText primary={result.name} key={i} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </ResultsPaper>
      </Grow>
    </SearchContainer>
  );
};
