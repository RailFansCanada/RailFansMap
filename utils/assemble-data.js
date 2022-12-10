const config = require("../src/config.json");
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require("fs");

if (!existsSync("build")) {
  mkdirSync("build");
}

const mapFeatures = (region, agency, data) => {
  const features = data.features.map((feature) => {
    feature.properties = {
      ...feature.properties,
      region: region.id,
      agency: agency.id,
      filterKey: data.metadata.filterKey,
      parent: data.metadata.id,
      class: data.metadata.type,
      color: data.metadata.color,
      offset: data.metadata.offset,
    };
    return feature;
  });

  const metadata = {
    ...data.metadata,
    agency: agency.id,
    region: region.id,
    bbox: data.bbox,
  };

  return { ...data, metadata, features };
};

const agencies = {};
config.agencies.forEach((agency) => {
  agencies[agency.id] = agency;
});
const regions = {};
config.regions.forEach((region) => {
  regions[region.id] = region;
});

const allCollections = config.regions.flatMap((region) => {
  console.info(`Scanning region ${region}`);
  return region.agencies.flatMap((id) => {
    console.info(`Loading ${id}`);
    const agency = agencies[id];
    return agency.data.map((path) => {
      console.info(`Reading ${path}`);
      const data = JSON.parse(readFileSync(`data/${path}`));
      return mapFeatures(region, agency, data);
    });
  });
});

// Write overall FeatureCollection file
const output = {
  type: "FeatureCollection",
  features: [],
};

allCollections.forEach((collection) => {
  output.features = [...output.features, ...collection.features];
});

writeFileSync("build/assembled.json", JSON.stringify(output));

// Extract metadata from feature collections
const metadata = {};
allCollections.map((collection) => {
  metadata[collection.metadata.id] = collection.metadata;
});

writeFileSync("build/metadata.json", JSON.stringify(metadata));

// Write search data which will be inflated into the search database
const stationSet = {};
allCollections
  .flatMap((collection) =>
    collection.features.filter(
      (feature) => feature.properties.type === "station-label"
    )
  )
  .forEach((station) => {
    const key =
      station.properties.name + station.properties.lines.sort().join();
    stationSet[key] = station;
  });

const stations = Object.values(stationSet).map((f) => ({
  $name: f.properties.name,
  $description: `${agencies[f.properties.agency].name} — ${
    regions[f.properties.region].title
  }`,
  $parent: f.properties.parent,
  $terms: f.properties.searchTerms?.join() ?? "",
  $lng: f.geometry.coordinates[0],
  $lat: f.geometry.coordinates[1],
  $lines: f.properties.lines.join(),
}));

const bounds = Object.values(metadata).map((entry) => ({
  $name: entry.name,
  $description: `${agencies[entry.agency].name} — ${
    regions[entry.region].title
  }`,
  $terms: entry.searchTerms?.join() ?? "",
  $id: entry.id,
  $type: entry.type,
  $bounds: JSON.stringify(entry.bbox),
}));

writeFileSync("build/search.json", JSON.stringify({ stations, bounds }));
