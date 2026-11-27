import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";

const config = JSON.parse(
  readFileSync(new URL("../src/config.json", import.meta.url), "utf8")
);

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

// Merge repeated Toronto GO/TTC and Vancouver TransLink station labels into
// shared interchange labels. Keep distinct platform points so the map can show
// the full station footprint and join them with a single connector pill.
const stationIdentity = (name) => {
  const normalized = name.trim().toLocaleLowerCase();
  if (normalized === "downsview") {
    return { key: "downsview park", name: "Downsview Park" };
  }
  return { key: normalized, name };
};

const distanceInMeters = (a, b) => {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(b[1] - a[1]);
  const longitudeDelta = radians(b[0] - a[0]);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(a[1])) *
      Math.cos(radians(b[1])) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const mergeNearbyStationLabels = (features) => {
  const mergedGroups = [];
  const removed = new Set();
  const connectorsToAdd = [];

  features.forEach((feature) => {
    const properties = feature.properties;
    const isTorontoRailInterchange =
      properties.region === "toronto" &&
      ["go", "ttc", "ttcStreetcar"].includes(properties.agency);
    const isVancouverTransLinkStation =
      properties.region === "vancouver" && properties.agency === "translink";
    if (
      feature.geometry.type !== "Point" ||
      properties.type !== "station-label" ||
      (!isTorontoRailInterchange && !isVancouverTransLinkStation)
    ) {
      return;
    }

    const identity = stationIdentity(properties.name);
    const coordinates = feature.geometry.coordinates;
    const group = mergedGroups.find(
      (candidate) =>
        candidate.identity.key === identity.key &&
        distanceInMeters(candidate.anchor, coordinates) <= 300
    );

    if (!group) {
      mergedGroups.push({
        identity,
        anchor: coordinates,
        features: [feature],
        representatives: [feature],
        coordinates: [coordinates],
      });
      return;
    }

    group.features.push(feature);
    if (
      !group.coordinates.some(
        (existing) => distanceInMeters(existing, coordinates) <= 5
      )
    ) {
      group.coordinates.push(coordinates);
      group.representatives.push(feature);
    } else {
      removed.add(feature);
    }
  });

  mergedGroups.forEach((group) => {
    const lines = [
      ...new Set(
        group.features.flatMap((feature) => feature.properties.lines ?? [])
      ),
    ].sort();
    const agencies = [
      ...new Set(
        group.features.flatMap((feature) =>
          feature.properties.agencies ?? [feature.properties.agency]
        )
      ),
    ];
    const parents = [
      ...new Set(
        group.features.flatMap((feature) =>
          feature.properties.parents ?? [feature.properties.parent]
        )
      ),
    ];
    const searchTerms = [
      ...new Set(
        group.features.flatMap((feature) => [
          ...(feature.properties.searchTerms ?? []),
          ...(feature.properties.name !== group.identity.name
            ? [feature.properties.name]
            : []),
        ])
      ),
    ];
    const platformFiltersFor = (coordinate) => {
      const platformFeatures = group.features.filter(
        (feature) =>
          distanceInMeters(feature.geometry.coordinates, coordinate) <= 5
      );
      return {
        filterKeys: [
          ...new Set(
            platformFeatures
              .map((feature) => feature.properties.filterKey)
              .filter((filterKey) => filterKey != null)
          ),
        ],
        alwaysVisible: platformFeatures.some(
          (feature) => feature.properties.filterKey == null
        ),
      };
    };
    const platformFilterInfoByCoordinate = new Map(
      group.coordinates.map((coordinate) => [
        coordinate,
        platformFiltersFor(coordinate),
      ])
    );

    group.representatives.forEach((representative) => {
      const properties = representative.properties;
      properties.name = group.identity.name;
      properties.lines = lines;
      properties.agencies = agencies;
      properties.parents = parents;
      properties.searchTerms = searchTerms;
      if (group.features.some((feature) => feature.properties.major)) {
        properties.major = true;
      }
      const platformFilters = platformFilterInfoByCoordinate.get(
        representative.geometry.coordinates
      );
      properties.stationFilterKeys = platformFilters.filterKeys;
      properties.stationAlwaysVisible = platformFilters.alwaysVisible;
      delete properties.filterKey;
    });

    let farthestPair = null;
    let farthestDistance = 0;
    for (let i = 0; i < group.coordinates.length; i++) {
      for (let j = i + 1; j < group.coordinates.length; j++) {
        const distance = distanceInMeters(
          group.coordinates[i],
          group.coordinates[j]
        );
        if (distance > farthestDistance) {
          farthestDistance = distance;
          farthestPair = [group.coordinates[i], group.coordinates[j]];
        }
      }
    }

    // Order each platform along the axis between the two farthest points.
    // With three or more platforms, this keeps the connector pill bent through
    // their real locations instead of cutting across the station complex.
    let connectorCoordinates = group.coordinates;
    if (farthestPair != null) {
      const meanLatitude =
        group.coordinates.reduce((sum, point) => sum + point[1], 0) /
        group.coordinates.length;
      const longitudeScale = Math.cos((meanLatitude * Math.PI) / 180);
      const [start, end] = farthestPair;
      const axisX = (end[0] - start[0]) * longitudeScale;
      const axisY = end[1] - start[1];
      const axisLengthSquared = axisX * axisX + axisY * axisY;
      const projection = (point) =>
        (((point[0] - start[0]) * longitudeScale) * axisX +
          (point[1] - start[1]) * axisY) /
        axisLengthSquared;
      connectorCoordinates = [...group.coordinates].sort(
        (a, b) => projection(a) - projection(b)
      );
    }

    group.representatives.forEach((representative) => {
      const pointIndex = connectorCoordinates.indexOf(
        representative.geometry.coordinates
      );
      if (connectorCoordinates.length < 2 || pointIndex === -1) {
        delete representative.properties.labelAnchor;
        return;
      }
      representative.properties.labelAnchor =
        pointIndex === 0
          ? "right"
          : pointIndex === connectorCoordinates.length - 1
          ? "left"
          : "top";
    });

    if (farthestPair == null || farthestDistance < 10) return;

    const properties = group.representatives[0].properties;
    const matchingConnectors = features
      .filter(
        (feature) =>
          feature.geometry.type === "LineString" &&
          feature.properties.type === "station-connector-label" &&
          feature.properties.region === properties.region &&
          stationIdentity(feature.properties.name).key === group.identity.key &&
          feature.geometry.coordinates.some(
            (coordinate) => distanceInMeters(group.anchor, coordinate) <= 300
          )
      )
      .sort((a, b) => {
        const nearestDistance = (feature) =>
          Math.min(
            ...feature.geometry.coordinates.map((coordinate) =>
              distanceInMeters(group.anchor, coordinate)
            )
          );
        return nearestDistance(a) - nearestDistance(b);
      });

    const connector = matchingConnectors[0];
    let connectorProperties;
    if (connector != null) {
      matchingConnectors.slice(1).forEach((duplicate) => removed.add(duplicate));
      connectorProperties = connector.properties;
      connectorProperties.name = group.identity.name;
      connectorProperties.lines = lines;
      for (const key of [
        "region",
        "agency",
        "parent",
        "class",
        "color",
        "offset",
      ]) {
        if (properties[key] == null) delete connectorProperties[key];
        else connectorProperties[key] = properties[key];
      }
      removed.add(connector);
    } else {
      connectorProperties = {
        ...properties,
        type: "station-connector-label",
        name: group.identity.name,
        lines,
      };
    }

    delete connectorProperties.filterKey;
    const platformFilterInfo = connectorCoordinates.map((coordinate) =>
      platformFilterInfoByCoordinate.get(coordinate)
    );

    for (let i = 0; i < connectorCoordinates.length - 1; i++) {
      connectorsToAdd.push({
        type: "Feature",
        properties: {
          ...connectorProperties,
          filterByEndpoints: true,
          startFilterKeys: platformFilterInfo[i].filterKeys,
          startAlwaysVisible: platformFilterInfo[i].alwaysVisible,
          endFilterKeys: platformFilterInfo[i + 1].filterKeys,
          endAlwaysVisible: platformFilterInfo[i + 1].alwaysVisible,
        },
        geometry: {
          type: "LineString",
          coordinates: [connectorCoordinates[i], connectorCoordinates[i + 1]],
        },
      });
    }
  });

  return features
    .filter((feature) => !removed.has(feature))
    .concat(connectorsToAdd);
};

const assembledFeatures = mergeNearbyStationLabels(
  allCollections.flatMap((collection) => collection.features)
);

// Write overall FeatureCollection file
const output = {
  type: "FeatureCollection",
  features: assembledFeatures,
};

writeFileSync("build/assembled.json", JSON.stringify(output));

// Extract metadata from feature collections
const metadata = {};
allCollections.map((collection) => {
  metadata[collection.metadata.id] = collection.metadata;
});

writeFileSync("build/metadata.json", JSON.stringify(metadata));

// Write search data which will be inflated into the search database
const stationSet = {};
assembledFeatures
  .filter((feature) => feature.properties.type === "station-label")
  .forEach((station) => {
    const key =
      station.properties.name + station.properties.lines.sort().join();
    stationSet[key] = station;
  });

const stations = Object.values(stationSet).map((f) => ({
  $name: f.properties.name,
  $description: `${(f.properties.agencies ?? [f.properties.agency])
    .map((id) => agencies[id].name)
    .join(" / ")} — ${regions[f.properties.region].title}`,
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
