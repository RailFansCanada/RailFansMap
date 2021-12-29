const fs = require("fs");
const Ajv = require("ajv");
const ajv = new Ajv();

const addFormats = require("ajv-formats");
addFormats(ajv);

const configSchema = require("../config.schema.json");
const dataSchema = require("../data.schema.json");
const config = require("../src/config.json");

expect.extend({
  validatedBy(received, schema) {
    const validate = ajv.compile(schema);

    const valid = validate(received);
    return {
      pass: valid,
      message: () =>
        `Received JSON is not valid against schema.\nErrors: ${JSON.stringify(
          validate.errors,
          null,
          2
        )}`,
    };
  },
});

test("validate config.json against config schema", () => {
  expect(config).validatedBy(configSchema);
});

test.each(Object.values(config.agencies).flatMap((agency) => agency.data))(
  "validate %s against data schema",
  (file) => {
    const data = require(`../data/${file}`);
    expect(data).validatedBy(dataSchema);
  }
);
