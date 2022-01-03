const fs = require("fs");
const bbox = require("@turf/bbox").default;
const bboxPolygon = require("@turf/bbox-polygon").default;

const config = require("../src/config.json");

function formatBBox(bbox) {
  return JSON.stringify(bbox).replaceAll(/,/g, ", ");
}

if (process.argv.length < 3) {
  console.error("Usage: node bbox.js <filename>");
  exit();
}

const filePath = process.argv[2];

if (filePath === "config.json" || filePath === "config") {
  console.log("Agencies:");
  const agencyBBoxes = {};
  config.agencies.forEach((agency) => {
    const allFeatures = [];
    agency.data.forEach((file) => {
      const content = fs.readFileSync(`./data/${file}`, { encoding: "utf-8" });
      /** @type {import('geojson').FeatureCollection} */
      const feature = JSON.parse(content);

      allFeatures.push(feature.features);
    });

    const featureBBox = bbox({
      type: "FeatureCollection",
      features: allFeatures.flat(),
    });
    agencyBBoxes[agency.id] = featureBBox;
    console.log(`    ${agency.id}: ${formatBBox(featureBBox)}`);
  });

  console.log("Regions:");
  config.regions.forEach((region) => {
    const regionFeatures = [];
    region.agencies.forEach((agency) => {
      const polygon = bboxPolygon(agencyBBoxes[agency]);
      regionFeatures.push(polygon);
    });

    const featureBBox = bbox({
      type: "FeatureCollection",
      features: regionFeatures
    });
    console.log(`    ${region.id}: ${formatBBox(featureBBox)}`);
  });
} else {
  const content = fs.readFileSync(`./data/${filePath}`, { encoding: "utf-8" });
  /** @type {import('geojson').FeatureCollection} */
  const feature = JSON.parse(content);

  const featureBBox = bbox(feature);

  console.log(`bbox for ${filePath}: ${formatBBox(featureBBox)}`);
}
