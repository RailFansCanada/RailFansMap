const fs = require("fs");
const config = require("../src/config.json");

const booleanContains = require("@turf/boolean-contains").default;
const bboxPolygon = require("@turf/bbox-polygon").default;
const bbox = require("@turf/bbox").default;

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

test.each(Object.values(config.agencies))(
  "validate bbox for $name",
  (value) => {
    const bboxes = value.data.map((file) => {
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

    expect(value.bbox).bboxContains(bbox(agencyCollection));
  }
);

test.each(Object.values(config.agencies).flatMap((it) => it.data))(
  "validate individual bbox for %s",
  (value) => {
    const content = fs.readFileSync(`./data/${value}`, { encoding: "utf-8" });
    /** @type {import('geojson').FeatureCollection} */
    const feature = JSON.parse(content);

    expect(feature).hasBBox();
    expect(feature.bbox).bboxContains(bbox(feature));
  }
);
