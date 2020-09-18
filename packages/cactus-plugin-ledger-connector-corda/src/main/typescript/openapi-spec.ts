import path from "path";
import * as OpenAPI from "express-openapi-validator/dist/framework/types";
import { DeployContractJarsEndpoint } from "./web-services/deploy-contract-jars-endpoint-constants";

export const CACTUS_OPEN_API_JSON: OpenAPI.OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "Hyperledger Cactus Plugin - Connector Corda",
    description: "Can perform basic tasks on a Corda ledger",
    version: "0.0.1",
  },
  servers: [
    {
      url: "https://www.cactus.stream/{basePath}",
      description: "Public test instance",
      variables: {
        basePath: {
          default: "",
        },
      },
    },
    {
      url: "http://localhost:4000/{basePath}",
      description: "Local test instance",
      variables: {
        basePath: {
          default: "",
        },
      },
    },
  ],
  components: {
    schemas: {
      JarFile: {
        type: "object",
        required: ["filename", "contentBase64"],
        additionalProperties: true,
        properties: {
          filename: {
            type: "string",
            nullable: false,
            minLength: 1,
            maxLength: 255,
          },
          contentBase64: {
            type: "string",
            format: "base64",
            nullable: false,
            minLength: 1,
            maxLength: 1024 * 1024 * 1024, // 1 GB
          },
        },
      },
      DeployContractJarsV1Request: {
        type: "object",
        required: ["jarFiles"],
        properties: {
          jarFiles: {
            type: "array",
            nullable: false,
            items: {
              minLength: 1,
              maxLength: 1024,
              $ref: "#/components/schemas/JarFile",
            },
          },
        },
      },
      DeployContractJarsSuccessV1Response: {
        type: "object",
        required: ["deployedJarFiles"],
        properties: {
          deployedJarFiles: {
            type: "array",
            items: {
              type: "string",
              minItems: 1,
              nullable: false,
            },
          },
        },
      },
      DeployContractJarsBadRequestV1Response: {
        type: "object",
        required: ["errors"],
        properties: {
          errors: {
            type: "array",
            items: {
              type: "string",
              minLength: 1,
              maxLength: 65535,
              minItems: 1,
              maxItems: 2048,
            },
          },
        },
      },
    },
  },
  paths: {
    [DeployContractJarsEndpoint.HTTP_PATH]: {
      [DeployContractJarsEndpoint.HTTP_VERB_LOWER_CASE]: {
        operationId: DeployContractJarsEndpoint.OPENAPI_OPERATION_ID,
        summary:
          "Deploys a set of jar files " +
          "(Cordapps, e.g. the contracts in Corda speak).",
        parameters: [],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/DeployContractJarsV1Request",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  $ref:
                    "#/components/schemas/DeployContractJarsSuccessV1Response",
                },
              },
            },
          },
          "400": {
            description: "Bad Request",
            content: {
              "application/json": {
                schema: {
                  $ref:
                    "#/components/schemas/DeployContractJarsBadRequestV1Response",
                },
              },
            },
          },
        },
      },
    },
  },
};

export async function exportToFileSystemAsJson(): Promise<void> {
  const fnTag = "OpenApiSpec#exportToFileSystemAsJson()";
  const fs = await import("fs");
  const packageNameShort = "plugin-ledger-connector-corda";
  const filename = `cactus-openapi-spec-${packageNameShort}.json`;
  const defaultDest = path.join(__dirname, "../../../", filename);
  const destination = process.argv[2] || defaultDest;

  // tslint:disable-next-line: no-console
  console.log(`${fnTag} destination=${destination}`);

  fs.writeFileSync(destination, JSON.stringify(CACTUS_OPEN_API_JSON, null, 4));
}

if (require.main === module) {
  exportToFileSystemAsJson();
}
