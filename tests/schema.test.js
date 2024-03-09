import { readFileSync } from "fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import configSchema from "../config.schema.json" assert { type: "json" };
import dataSchema from "../data.schema.json" assert { type: "json" };
import config from "../src/config.json" assert { type: "json" };

const ajv = new Ajv();
addFormats(ajv);

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
    const content = readFileSync(`./data/${file}`);
    const data = JSON.parse(content);
    expect(data).validatedBy(dataSchema);
  }
);
