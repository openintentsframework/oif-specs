### OIF Specifications

This repository is the canonical, versioned source of truth for OIF protocol standards and specifications.

It includes:
- API standards for Quote and Intent submission
- Machine-readable OpenAPI schemas
- Language-friendly TypeScript interfaces for client/server implementation

## Repository structure

- `specs/openapi.yaml`: OpenAPI 3.0 specification covering Quote and Intent endpoints
- `schemas/typescript/types.ts`: TypeScript interfaces for all OIF protocol types
- `schemas/typescript/schemas.generated.ts`: Auto-generated Zod schemas from TypeScript types
- `docs/references.md`: Curated external references to related off-chain APIs and intent protocols

## API standards

This repository defines two endpoints:

- Quote: quote generation for requested outputs based on available inputs
- Intent: submit a previously quoted, signed order for execution

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
- The legacy `fillerPerformsOpen` boolean is deprecated. Prefer `originSubmission` for forward compatibility.

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