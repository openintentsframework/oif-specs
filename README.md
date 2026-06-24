### OIF Specifications

This repository is the canonical, versioned source of truth for OIF protocol standards and specifications.

It includes:

- API standards for Quote, Intent submission, and Asset discovery
- Machine-readable OpenAPI schemas
- Language-friendly TypeScript interfaces for client/server implementation

## Repository structure

- `specs/openapi.yaml`: OpenAPI 3.0 specification covering Quote, Intent, and Asset discovery endpoints
- `schemas/typescript/types.ts`: TypeScript interfaces for all OIF protocol types
- `schemas/typescript/schemas.generated.ts`: Auto-generated Zod schemas from TypeScript types
- `docs/references.md`: Curated external references to related off-chain APIs and intent protocols

## Address format (CAIP-350)

OIF uses **CAIP-350 text identifiers** for chain-specific addresses in the API. This provides a human-readable, integrator-friendly format that is easy to work with.

### ChainAddress format

All addresses in the API use the `ChainAddress` object format:

```json
{
  "chain": "eip155:8453",
  "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
}
```

- **chain**: CAIP-2 chain identifier (e.g., `eip155:1` for Ethereum, `eip155:8453` for Base)
- **address**: Native address format (e.g., `0x...` for EVM chains)

### Examples

```json
// USDC on Ethereum mainnet
{
  "chain": "eip155:1",
  "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
}

// vitalik.eth on Base
{
  "chain": "eip155:8453",
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
}
```

### Related standards

- [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md): Chain identifier format
- [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md): Account identifier format
- [CAIP-350](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-350.md): Text identifier for chain-specific addresses

> **Note**: On-chain contracts (oif-contracts) continue to use ERC-7930 binary format for gas efficiency. Solvers and tooling handle the conversion between text (API) and binary (on-chain) representations.

## API standards

This repository defines the following endpoints:

- **Quote**: quote generation for requested outputs based on available inputs
- **Intent**: submit a previously quoted, signed order for execution
- **Asset Discovery**: discover supported assets and chains
  - `GET /api/tokens`: returns all supported assets across all configured blockchain networks
  - `GET /api/tokens/{chain}`: returns supported assets for a specific chain (e.g., `eip155:1`)

Authoritative schema: `specs/openapi.yaml`

TypeScript-friendly interfaces are provided in `schemas/typescript/types.ts`

### Origin submission preference

To express user preference for gasless execution and who submits the origin transaction, use `originSubmission`:

```json
{
  "originSubmission": {
    "mode": "user", // or "protocol"
    "schemes": ["erc-4337", "permit2", "erc20-permit", "eip-3009"]
  }
}
```

- **mode**: who is expected to submit the origin transaction.
- **schemes**: acceptable signing/authorization schemes for interoperability.

Notes:

- This is orthogonal to `lock` (asset state) and focuses on submission responsibility and signing surface.

### Asset discovery

To discover which assets and chains are supported by a provider, use the asset discovery endpoints:

- `GET /api/tokens`: Returns all supported networks and their assets
- `GET /api/tokens/{chain}`: Returns assets for a specific chain (e.g., `eip155:1`)

The response includes asset metadata (address in CAIP-350 format, symbol, and decimals) for each supported network. This enables clients to build asset and chain selection UIs and validate that a provider can theoretically fulfill a given intent before requesting quotes.

Example response:

```json
{
  "networks": {
    "eip155:1": {
      "chain": "eip155:1",
      "assets": [
        {
          "address": { "chain": "eip155:1", "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
          "symbol": "USDC",
          "decimals": 6
        }
      ]
    }
  }
}
```

## Generating OpenAPI from TypeScript

The OpenAPI specification is auto-generated from TypeScript types using a TypeScript → Zod → OpenAPI pipeline. To regenerate:

```bash
npm install
npm run generate:openapi
```

The TypeScript types in `schemas/typescript/types.ts` are the source of truth. The generation process:

1. `ts-to-zod` converts TypeScript types to Zod schemas with validation
2. `@asteasolutions/zod-to-openapi` converts Zod schemas to OpenAPI specification
3. JSDoc annotations (@description, @pattern, @example) are preserved throughout the pipeline

## How to view the OpenAPI without running anything locally

Use any of the following online viewers. After this repo is public, you can point them directly to the raw `openapi.yaml` URL; until then, copy-paste the YAML content into the viewer.

- Swagger Editor: open `https://editor.swagger.io/` and paste the contents of `specs/openapi.yaml`.

No local server is required.

## Versioning

The specs follow semantic versioning at the file level. Backwards-compatible changes (additive fields) will increment the minor version via Git tags/releases. Breaking changes will increment the major version. See Git history and release notes for details.

## Contributing

- Propose changes via pull request with rationale and, where applicable, example payloads.
- Modify TypeScript schemas in `schemas/typescript/types.ts` and run `npm run generate:openapi` to update the OpenAPI spec.
- Favor explicit types and self-explanatory naming. Avoid ambiguous or protocol-specific jargon without a definition.

## License

This repository is licensed under the terms of the `LICENSE` file at the root of the repository.
