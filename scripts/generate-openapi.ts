#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const TYPESCRIPT_SCHEMA_PATH = path.join(__dirname, '../schemas/typescript/types.ts');
const OUTPUT_PATH = path.join(__dirname, '../specs/openapi.yaml');

// Mapping of TypeScript types to OpenAPI schema names and descriptions
const schemaMapping: Record<string, { description?: string; openApiName?: string }> = {
  Address: {
    description: 'ERC-7930 interoperable address'
  },
  Amount: {
    description: 'Integer encoded as a string to preserve precision (e.g., uint256)'
  },
  AssetLockReference: {
    description: 'Reference to a lock in a locking system'
  },
  AvailableInput: {
    description: undefined // Will use properties from TypeScript
  },
  RequestedOutput: {
    description: undefined
  },
  RequestedOutputDetails: {
    description: undefined
  },
  QuotePreference: {
    description: undefined
  },
  GetQuoteRequest: {
    description: undefined
  },
  Eip712Order: {
    description: 'EIP-712 typed data for execution'
  },
  QuoteDetails: {
    description: undefined
  },
  Quote: {
    description: undefined
  },
  GetQuoteResponse: {
    description: undefined
  },
  IntentRequest: {
    description: undefined
  },
  IntentResponse: {
    description: undefined
  }
};

// Full OpenAPI specification with all metadata preserved
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'OIF API',
    version: '0.1.0',
    description: 'API specifications for OIF protocol covering quote generation and intent submission.\nAmount fields are strings representing integers (e.g., uint256) to preserve precision across transports.'
  },
  servers: [
    { url: 'https://api.example.com' }
  ],
  tags: [
    { name: 'quote', description: 'Quote generation' },
    { name: 'intent', description: 'Intent submission' }
  ],
  paths: {
    '/v1/quote': {
      post: {
        summary: 'Generate executable quotes for requested outputs given available inputs.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/GetQuoteRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Quotes successfully generated',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/GetQuoteResponse' }
              }
            }
          },
          '400': { description: 'Malformed request' },
          '422': { description: 'Inputs cannot satisfy requested outputs' }
        }
      }
    },
    '/v1/intent': {
      post: {
        summary: 'Submit a previously quoted, signed order for execution.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/IntentRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Intent accepted',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/IntentResponse' }
              }
            }
          },
          '400': { description: 'Malformed request' },
          '422': { description: 'Invalid signature or order' }
        }
      }
    }
  },
  components: {
    schemas: {} as any
  }
};

async function generateJsonSchema() {
  console.log('Generating JSON Schema from TypeScript...');
  
  // Use typescript-json-schema to generate JSON Schema
  const { stdout } = await execAsync(
    `npx typescript-json-schema ${TYPESCRIPT_SCHEMA_PATH} "*" --required --strictNullChecks`
  );
  
  return JSON.parse(stdout);
}

function convertJsonSchemaToOpenApi(jsonSchema: any): any {
  const openApiSchemas: any = {};
  
  // Extract definitions from JSON Schema
  const definitions = jsonSchema.definitions || {};
  
  // Process each TypeScript definition
  for (const [name, schema] of Object.entries(definitions)) {
    const mapping = schemaMapping[name] || {};
    const openApiName = mapping.openApiName || name;
    
    // Convert the schema
    const convertedSchema = convertSchemaObject(schema as any);
    
    // Apply any custom descriptions from mapping
    if (mapping.description) {
      convertedSchema.description = mapping.description;
    }
    
    // Special handling for specific types
    if (name === 'Address') {
      openApiSchemas[openApiName] = {
        type: 'string',
        description: 'ERC-7930 interoperable address'
      };
    } else if (name === 'Amount') {
      openApiSchemas[openApiName] = {
        type: 'string',
        description: 'Integer encoded as a string to preserve precision (e.g., uint256)',
        pattern: '^[0-9]+$'
      };
    } else if (name === 'AssetLockReference') {
      const schema = convertedSchema;
      // Ensure proper structure for AssetLockReference
      if (schema.properties) {
        schema.description = 'Reference to a lock in a locking system';
        if (schema.properties.kind) {
          schema.properties.kind.enum = ['the-compact', 'rhinestone'];
        }
        if (schema.properties.params) {
          schema.properties.params.description = 'Lock-specific parameters';
        }
      }
      openApiSchemas[openApiName] = schema;
    } else if (name === 'AvailableInput') {
      // Ensure proper field descriptions
      if (convertedSchema.properties) {
        if (convertedSchema.properties.user) {
          convertedSchema.properties.user = { '$ref': '#/components/schemas/Address' };
        }
        if (convertedSchema.properties.asset) {
          convertedSchema.properties.asset = { '$ref': '#/components/schemas/Address' };
        }
        if (convertedSchema.properties.amount) {
          convertedSchema.properties.amount = { '$ref': '#/components/schemas/Amount' };
        }
        if (convertedSchema.properties.lock) {
          convertedSchema.properties.lock = { '$ref': '#/components/schemas/AssetLockReference' };
        }
      }
      openApiSchemas[openApiName] = convertedSchema;
    } else if (name === 'RequestedOutput') {
      if (convertedSchema.properties) {
        if (convertedSchema.properties.receiver) {
          convertedSchema.properties.receiver = { '$ref': '#/components/schemas/Address' };
        }
        if (convertedSchema.properties.asset) {
          convertedSchema.properties.asset = { '$ref': '#/components/schemas/Address' };
        }
        if (convertedSchema.properties.amount) {
          convertedSchema.properties.amount = { '$ref': '#/components/schemas/Amount' };
        }
        if (convertedSchema.properties.calldata) {
          convertedSchema.properties.calldata.description = 'Optional calldata describing how the receiver will consume the output';
        }
      }
      openApiSchemas[openApiName] = convertedSchema;
    } else if (name === 'RequestedOutputDetails') {
      if (convertedSchema.properties) {
        if (convertedSchema.properties.user) {
          convertedSchema.properties.user = { '$ref': '#/components/schemas/Address' };
        }
        if (convertedSchema.properties.asset) {
          convertedSchema.properties.asset = { '$ref': '#/components/schemas/Address' };
        }
        if (convertedSchema.properties.amount) {
          convertedSchema.properties.amount = { '$ref': '#/components/schemas/Amount' };
        }
      }
      openApiSchemas[openApiName] = convertedSchema;
    } else if (name === 'QuotePreference') {
      openApiSchemas[openApiName] = {
        type: 'string',
        enum: ['price', 'speed', 'input-priority', 'trust-minimization']
      };
    } else if (name === 'GetQuoteRequest') {
      if (convertedSchema.properties) {
        if (convertedSchema.properties.user) {
          convertedSchema.properties.user = { '$ref': '#/components/schemas/Address' };
        }
        if (convertedSchema.properties.availableInputs) {
          convertedSchema.properties.availableInputs.description = 'Order of inputs is significant if preference is \'input-priority\'';
        }
        if (convertedSchema.properties.minValidUntil) {
          convertedSchema.properties.minValidUntil.description = 'Minimum validity timestamp (seconds)';
        }
        if (convertedSchema.properties.preference) {
          convertedSchema.properties.preference = { '$ref': '#/components/schemas/QuotePreference' };
        }
      }
      openApiSchemas[openApiName] = convertedSchema;
    } else if (name === 'Eip712Order') {
      if (convertedSchema.properties) {
        if (convertedSchema.properties.domain) {
          convertedSchema.properties.domain = { '$ref': '#/components/schemas/Address' };
        }
      }
      openApiSchemas[openApiName] = convertedSchema;
    } else if (name === 'QuoteDetails') {
      if (convertedSchema.properties && convertedSchema.properties.availableInputs) {
        // Special handling for availableInputs in QuoteDetails
        convertedSchema.properties.availableInputs = {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              user: { '$ref': '#/components/schemas/Address' },
              asset: { '$ref': '#/components/schemas/Address' },
              amount: { '$ref': '#/components/schemas/Amount' },
              lockType: {
                type: 'string',
                enum: ['the-compact'],
                description: 'If empty, the asset needs to be escrowed'
              }
            },
            required: ['user', 'asset', 'amount']
          }
        };
      }
      openApiSchemas[openApiName] = convertedSchema;
    } else if (name === 'Quote') {
      if (convertedSchema.properties) {
        if (convertedSchema.properties.validUntil) {
          convertedSchema.properties.validUntil.description = 'Quote validity timestamp (seconds)';
        }
        if (convertedSchema.properties.eta) {
          convertedSchema.properties.eta.description = 'Estimated time of arrival (seconds)';
        }
      }
      openApiSchemas[openApiName] = convertedSchema;
    } else if (name === 'IntentRequest') {
      if (convertedSchema.properties) {
        if (convertedSchema.properties.order) {
          convertedSchema.properties.order.description = 'EIP-712 typed data for a gasless cross-chain order';
        }
        if (convertedSchema.properties.signature) {
          convertedSchema.properties.signature.description = undefined; // Let it use additionalProperties: true
        }
      }
      openApiSchemas[openApiName] = convertedSchema;
    } else if (name === 'IntentResponse') {
      if (convertedSchema.properties) {
        if (convertedSchema.properties.orderId) {
          convertedSchema.properties.orderId.description = 'Assigned order identifier if accepted';
        }
      }
      openApiSchemas[openApiName] = convertedSchema;
    } else {
      openApiSchemas[openApiName] = convertedSchema;
    }
  }
  
  return openApiSchemas;
}

function convertSchemaObject(schema: any): any {
  const converted: any = {};
  
  // Copy basic properties
  if (schema.type) converted.type = schema.type;
  if (schema.description) converted.description = schema.description;
  if (schema.pattern) converted.pattern = schema.pattern;
  if (schema.enum) converted.enum = schema.enum;
  
  // Handle properties for objects
  if (schema.properties) {
    converted.properties = {};
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      converted.properties[propName] = convertSchemaObject(propSchema as any);
    }
  }
  
  // Handle required fields
  if (schema.required && schema.required.length > 0) {
    converted.required = schema.required;
  }
  
  // Handle arrays
  if (schema.type === 'array' && schema.items) {
    converted.items = convertSchemaObject(schema.items);
  }
  
  // Handle references
  if (schema.$ref) {
    const refName = schema.$ref.replace('#/definitions/', '');
    return { '$ref': `#/components/schemas/${refName}` };
  }
  
  // Handle anyOf/oneOf/allOf
  if (schema.anyOf) {
    converted.anyOf = schema.anyOf.map((s: any) => convertSchemaObject(s));
  }
  if (schema.oneOf) {
    converted.oneOf = schema.oneOf.map((s: any) => convertSchemaObject(s));
  }
  if (schema.allOf) {
    converted.allOf = schema.allOf.map((s: any) => convertSchemaObject(s));
  }
  
  // Special handling for Record<string, unknown> -> additionalProperties
  if (schema.type === 'object' && Object.keys(schema).length === 1) {
    converted.additionalProperties = true;
  }
  if (schema.additionalProperties !== undefined) {
    converted.additionalProperties = schema.additionalProperties === false 
      ? undefined 
      : schema.additionalProperties === true 
        ? true 
        : convertSchemaObject(schema.additionalProperties);
  }
  
  return converted;
}

async function main() {
  try {
    console.log('Starting OpenAPI generation from TypeScript schemas...');
    
    // Generate JSON Schema from TypeScript
    const jsonSchema = await generateJsonSchema();
    
    // Convert JSON Schema to OpenAPI schemas
    const openApiSchemas = convertJsonSchemaToOpenApi(jsonSchema);
    
    // Merge with template
    openApiSpec.components.schemas = openApiSchemas;
    
    // Convert to YAML with proper formatting
    const yamlStr = yaml.dump(openApiSpec, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
      quotingType: "'",
      forceQuotes: false
    });
    
    // Write to file
    fs.writeFileSync(OUTPUT_PATH, yamlStr);
    
    console.log(`✅ OpenAPI spec generated successfully at: ${OUTPUT_PATH}`);
    console.log('Generated schemas:', Object.keys(openApiSchemas));
  } catch (error) {
    console.error('❌ Error generating OpenAPI spec:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}