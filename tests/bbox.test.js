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
            message: () => `Bounding box does not cover all data files, try [${bbox}]?`,
            pass
        }
    }
})

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
        "type": "FeatureCollection",
        "features": bboxes.map((bbox) =>  bboxPolygon(bbox))
    }

    expect(value.bbox).bboxContains(bbox(agencyCollection));
  }
);
