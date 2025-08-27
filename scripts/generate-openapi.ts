#!/usr/bin/env ts-node

import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { z } from "zod";
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import * as schemas from "../schemas/typescript/schemas.generated";

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z);

const OUTPUT_PATH = path.join(__dirname, "../specs/openapi.yaml");

// Create OpenAPI registry
const registry = new OpenAPIRegistry();

// Register all schemas as components
registry.register("Address", schemas.addressSchema);
registry.register("Amount", schemas.amountSchema);
registry.register("OrderType", schemas.orderTypeSchema);
registry.register("AssetLockReference", schemas.assetLockReferenceSchema);
registry.register("AvailableInput", schemas.availableInputSchema);
registry.register("RequestedOutput", schemas.requestedOutputSchema);
registry.register(
  "RequestedOutputDetails",
  schemas.requestedOutputDetailsSchema
);
registry.register("QuotePreference", schemas.quotePreferenceSchema);
registry.register("GetQuoteRequest", schemas.getQuoteRequestSchema);
registry.register("Eip712Order", schemas.eip712OrderSchema);
registry.register("QuoteDetails", schemas.quoteDetailsSchema);
registry.register("Quote", schemas.quoteSchema);
registry.register("GetQuoteResponse", schemas.getQuoteResponseSchema);
registry.register("IntentRequest", schemas.intentRequestSchema);
registry.register("IntentResponse", schemas.intentResponseSchema);
registry.register("IntentResponseStatus", schemas.intentResponseStatusSchema);

// Register API endpoints
registry.registerPath({
  method: "post",
  path: "/v1/quote",
  summary:
    "Generate executable quotes for requested outputs given available inputs.",
  tags: ["quote"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.getQuoteRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Quotes successfully generated",
      content: {
        "application/json": {
          schema: schemas.getQuoteResponseSchema,
        },
      },
    },
    400: {
      description: "Malformed request",
    },
    422: {
      description: "Inputs cannot satisfy requested outputs",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/v1/intent",
  summary: "Submit a previously quoted, signed order for execution.",
  tags: ["intent"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: schemas.intentRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Intent accepted",
      content: {
        "application/json": {
          schema: schemas.intentResponseSchema,
        },
      },
    },
    400: {
      description: "Malformed request",
    },
    422: {
      description: "Invalid signature or order",
    },
  },
});

async function main() {
  try {
    console.log("Starting OpenAPI generation from Zod schemas...");

    // Generate OpenAPI document
    const generator = new OpenApiGeneratorV3(registry.definitions);
    const openApiDocument = generator.generateDocument({
      openapi: "3.0.0",
      info: {
        title: "OIF API",
        version: "0.1.0",
        description:
          "API specifications for OIF protocol covering quote generation and intent submission.\nAmount fields are strings representing integers (e.g., uint256) to preserve precision across transports.",
      },
      servers: [{ url: "https://api.example.com" }],
      tags: [
        { name: "quote", description: "Quote generation" },
        { name: "intent", description: "Intent submission" },
      ],
    });

    // Convert to YAML
    const yamlStr = yaml.dump(openApiDocument, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
      quotingType: "'",
      forceQuotes: false,
    });

    // Write to file
    fs.writeFileSync(OUTPUT_PATH, yamlStr);

    console.log(`✅ OpenAPI spec generated successfully at: ${OUTPUT_PATH}`);
    console.log(
      "Generated schemas:",
      Object.keys(openApiDocument.components?.schemas || {})
    );
  } catch (error) {
    console.error("❌ Error generating OpenAPI spec:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
