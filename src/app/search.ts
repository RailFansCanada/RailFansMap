import { BBox } from "geojson";
import initSqlJs, { Database } from "sql.js";
import ddl from "./database.sql";

export type Station = {
  name: string;
  description: string;
  lines: string[];
  lng: number;
  lat: number;
  parent: string;
};

export type StationResult = Station & { type: "station"; rank: number };

export type BoundsResult = {
  name: string;
  description: string;
  id: string;
  type: string;
  bounds: BBox;
  rank: number;
};

export type SearchResult = StationResult | BoundsResult;

function escapeQuery(query: string): string {
  const cleaned = query.replace(/\"/g, '""');
  return `"${cleaned}"`;
}

export async function prepDatabase(): Promise<Database> {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  db.run(ddl);
  return db;
}

export async function processFeatures(db: Database, entries: any[]) {
  db.exec("BEGIN TRANSACTION;");

  const stmt = db.prepare(
    "INSERT INTO stations_search VALUES($name, $description, $parent, $terms, $lines, $lng, $lat)"
  );

  entries.forEach((entry) => {
    stmt.run(entry);
  });

  db.exec("COMMIT;");
}

export async function processBounds(db: Database, entries: any[]) {
  db.exec("BEGIN TRANSACTION;");

  const stmt = db.prepare(
    "INSERT INTO bounds_search VALUES($name, $description, $terms, $id, $type, $bounds)"
  );

  entries.forEach((entry) => {
    stmt.run(entry);
  });

  db.exec("COMMIT;");
}

async function searchStations(
  db: Database,
  query: string,
  limit: number = 10
): Promise<StationResult[]> {
  if (query === "") {
    return [];
  }

  const stmt = db.prepare(
    "SELECT *, rank FROM stations_search WHERE stations_search MATCH $query || '*' ORDER BY rank LIMIT $limit"
  );
  stmt.bind({ $query: query, $limit: limit });

  const results: StationResult[] = [];
  while (stmt.step()) {
    const o = stmt.getAsObject();

    const station = {
      ...o,
      type: "station",
      lines: (o.lines as string).split(","),
    };

    results.push(station as unknown as StationResult);
  }

  stmt.free();

  return results;
}

async function searchBounds(
  db: Database,
  query: string,
  limit: number = 10
): Promise<BoundsResult[]> {
  if (query === "") {
    return [];
  }

  const stmt = db.prepare(
    "SELECT *, rank FROM bounds_search WHERE bounds_search MATCH $query || '*' ORDER BY rank LIMIT $limit"
  );
  stmt.bind({ $query: query, $limit: limit });

  const results: BoundsResult[] = [];
  while (stmt.step()) {
    const o = stmt.getAsObject();

    const station = { ...o, bounds: JSON.parse(o.bounds as string) as BBox };

    results.push(station as unknown as BoundsResult);
  }

  stmt.free();

  return results;
}

export async function search(
  db: Database,
  query: string
): Promise<SearchResult[]> {
  const stations = await searchStations(db, escapeQuery(query));
  const bounds = await searchBounds(db, escapeQuery(query));

  const all = [...stations, ...bounds].sort((a, b) => a.rank - b.rank);
  return all;
}
