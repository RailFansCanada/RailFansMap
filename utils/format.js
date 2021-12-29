const fs = require("fs");
const Ajv = require("ajv");
const ajv = new Ajv();

const addFormats = require("ajv-formats");
addFormats(ajv);

const dataSchema = require("../data.schema.json");
const { exit } = require("process");

if (process.argv.length < 3) {
  console.error("Usage: node format.js <filename> [-o write output]");
  exit();
}

const filePath = process.argv[2];
const doWrite = process.argv.find((it) => {
  return it == "-o";
});

const fileData = fs.readFileSync(filePath, { encoding: "utf-8" });
/** @type {import('geojson').FeatureCollection} */
const json = JSON.parse(fileData);

const validate = ajv.compile(dataSchema);
const valid = validate(json);

if (!valid) {
  console.error(
    `${filePath} does not match the data schema and can not be formatted`
  );
  console.log(validate.errors);
  exit();
}

const features = json.features;

// Temporary replacement
json.features = "$$FEATURES$$";

// Pretty-print everything except the features
const prettyPrinted = JSON.stringify(json, null, 2);
const stringifiedFeatures = features.map((feature) =>
  JSON.stringify(feature)
    .replace(/{"/g, '{ "')
    .replace(/}/g, " }")
    .replace(/,/g, ", ")
    .replace(/:/g, ": ")
    .trim()
);

const result = prettyPrinted.replace(
  '"$$FEATURES$$"',
  `[\n${stringifiedFeatures.map((string) => `    ${string}`).join(",\n")}\n  ]`
);

if (doWrite) {
  fs.writeFileSync(filePath, result);
} else {
  console.log(result);
}
