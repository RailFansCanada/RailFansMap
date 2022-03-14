import initSqlJs, { Database } from "sql.js";

export type Station = {
  name: string;
  description: string;
  lines: string[];
  lng: number;
  lat: number;
};

export async function prepDatabase(): Promise<Database> {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  const sqlStr =
    "CREATE VIRTUAL TABLE stations_search USING fts3 (\
        name TEXT NOT NULL,\
        description TEXT NOT NULL,\
        lines TEXT NOT NULL,\
        lng REAL NOT NULL,\
        lat REAL NOT NULL\
      );";

  db.run(sqlStr);

  return db;
}

export async function insertStations(db: Database, stations: Station[]) {
  db.exec("BEGIN TRANSACTION;");

  const stmt = db.prepare(
    "INSERT INTO stations_search VALUES($name, $description, $lines, $lng, $lat)"
  );
  stations.forEach((s) => {
    const station = {
      $name: s.name,
      $description: s.description,
      $lng: s.lng,
      $lat: s.lat,
      $lines: s.lines.join(),
    };
    stmt.run(station);
  });

  db.exec("COMMIT;");
}

export async function searchStations(
  db: Database,
  query: string,
  limit: number = 10
): Promise<Station[]> {
  if (query === "") {
    return [];
  }

  const stmt = db.prepare(
    "SELECT * FROM stations_search WHERE stations_search MATCH $query || '*' LIMIT $limit"
  );
  stmt.bind({ $query: query, $limit: limit });

  const results: Station[] = [];
  while (stmt.step()) {
    const o = stmt.getAsObject();

    const station = { ...o /*lines: (o.lines as string).split(",")*/ };

    results.push(station as unknown as Station);
  }

  stmt.free();

  return results;
}
