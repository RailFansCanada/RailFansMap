const fs = require("fs");
const config = require("../src/config.json");

const booleanContains = require("@turf/boolean-contains").default;
const bboxPolygon = require("@turf/bbox-polygon").default;
const bbox = require("@turf/bbox").default;

function getAgencyBboxCollection(agency) {
  const bboxes = agency.data.map((file) => {
    const content = fs.readFileSync(`./data/${file}`, { encoding: "utf-8" });

    /** @type {import('geojson').FeatureCollection} */
    const feature = JSON.parse(content);
    return bbox(feature);
  });

  /** @type {import('geojson').FeatureCollection} */
  const agencyCollection = {
    type: "FeatureCollection",
    features: bboxes.map((bbox) => bboxPolygon(bbox)),
  };
  return agencyCollection;
}

expect.extend({
  bboxContains(received, bbox) {
    const receivedPolygon = bboxPolygon(received);
    const polygon = bboxPolygon(bbox);

    const pass = booleanContains(receivedPolygon, polygon);
    return {
      message: () =>
        `Bounding box does not cover all data files, try [${bbox}]?`,
      pass,
    };
  },
  hasBBox(received) {
    const pass = received.bbox != null && received.bbox instanceof Array;
    let suggestedBBox = null;
    if (!pass) {
      suggestedBBox = bbox(received);
    }
    return {
      message: () =>
        `Feature does not have a bounding box, try [${suggestedBBox}]?`,
      pass,
    };
  },
});

test.each(config.agencies)(
  "validate bbox for $name",
  (value) => {
    const agencyCollection = getAgencyBboxCollection(value);

    expect(value.bbox).bboxContains(bbox(agencyCollection));
  }
);

test.each(config.agencies.flatMap((it) => it.data))(
  "validate individual bbox for %s",
  (value) => {
    const content = fs.readFileSync(`./data/${value}`, { encoding: "utf-8" });
    /** @type {import('geojson').FeatureCollection} */
    const feature = JSON.parse(content);

    expect(feature).hasBBox();
    expect(feature.bbox).bboxContains(bbox(feature));
  }
);

test.each(Object.values(config.regions))(
  "validate bbox for region $title",
  (value) => {
    const features = value.agencies.flatMap((agency) => {
      return getAgencyBboxCollection(config.agencies.find((a) => a.id === agency)).features;
    });

    /** @type {import('geojson').FeatureCollection} */
    const collection = {
      "type": "FeatureCollection",
      features
    }

    expect(value.bbox).bboxContains(bbox(collection));
  }
);
