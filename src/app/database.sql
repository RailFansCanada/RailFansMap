CREATE VIRTUAL TABLE stations_search USING fts5 (
    name,
    description,
    parent,
    terms,
    lines,
    lng,
    lat
);
CREATE VIRTUAL TABLE bounds_search USING fts5 (
    name,
    description,
    terms,
    id,
    type,
    bounds
);