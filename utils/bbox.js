const fs = require("fs");
const bbox = require("@turf/bbox").default;

const config = require("../src/config.json");

Object.values(config.agencies).flatMap((it) => it.data).forEach(file => {
    const content = fs.readFileSync(`./data/${file}`, { encoding: "utf-8" });
    /** @type {import('geojson').FeatureCollection} */
    const feature = JSON.parse(content);

    const featureBBox = bbox(feature);
    feature.bbox = featureBBox;

    fs.writeFileSync(`./data/${file}`, JSON.stringify(feature));
});
