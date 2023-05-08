const fs = require("fs")
const path = require("path")
const Ajv = require("ajv")
const standaloneCode = require("ajv/dist/standalone").default

const schema = {
  $id: "https://example.com/bar.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    title: { type: "string" },
    implementationSteps: {
        type: "array",
        items: {
            type: "object",
            properties: {
                "step": {
                    type: "object",
                    properties: {
                        details: { type: "string" },
                    },
                    "required": ["details"]
                }
            }
        }
    }
  },
  "required": ["title"]
}

// The generated code will have a default export:
// `module.exports = <validateFunctionCode>;module.exports.default = <validateFunctionCode>;`
const ajv = new Ajv({ code: { source: true, esm: true, ts: true, allErrors: true } })
const validate = ajv.compile(schema)
let moduleCode = standaloneCode(ajv, validate)
moduleCode.esm = true;


// Now you can write the module code to file
fs.writeFileSync(path.join(__dirname, "./src/validators/validate-bestpractice.ts"), moduleCode)
