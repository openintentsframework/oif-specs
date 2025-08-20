### OIF Specifications

This repository is the canonical, versioned source of truth for OIF protocol standards and specifications.

It includes:
- API standards for Get Quote and Submit Intent
- Machine-readable OpenAPI schemas
- Language-friendly TypeScript interfaces for client/server implementation

## Repository structure

- `specs/openapi.yaml`: OpenAPI 3.0 specification covering Get Quote and Submit Intent endpoints
- `schemas/typescript/get-quote.ts`: TypeScript interfaces for Get Quote request/response
- `schemas/typescript/intent.ts`: TypeScript interfaces for Submit Intent request/response
- `docs/references.md`: Curated external references to related off-chain APIs and intent protocols

## API standards

This repository defines two endpoints:

- Get Quote: quote generation for requested outputs based on available inputs
- Submit Intent: submit a previously quoted, signed order for execution

Authoritative schema: `specs/openapi.yaml`

TypeScript-friendly interfaces are provided in `schemas/typescript/`:

- `schemas/typescript/get-quote.ts`
- `schemas/typescript/intent.ts`

### Order types and exactness

Requests must include an `orderType` string to indicate how intents and amounts should be interpreted. The API is open-ended for future order types; current recognized values are:

- `swap-exact-input`: available input amounts are exact; requested output amounts are minimums (at least this amount, subject to slippage).
- `swap-exact-output`: requested output amounts are exact; available input amounts are maximums (spend up to this amount).

Example request shape (abridged):

```json
{
  "user": "0x...",
  "availableInputs": [{ "user": "0x...", "asset": "0xTokenIn", "amount": "1000000000000000000" }],
  "requestedOutputs": [{ "receiver": "0x...", "asset": "0xTokenOut", "amount": "990000000000000000" }],
  "orderType": "swap-exact-input",
  "preference": "price"
}
```

See `components.schemas.OrderType` in `specs/openapi.yaml` for the authoritative definition.

## How to view the OpenAPI without running anything locally

Use any of the following online viewers. After this repo is public, you can point them directly to the raw `openapi.yaml` URL; until then, copy-paste the YAML content into the viewer.

- Swagger Editor: open `https://editor.swagger.io/` and paste the contents of `specs/openapi.yaml`.

No local server is required.

## Versioning

The specs follow semantic versioning at the file level. Backwards-compatible changes (additive fields) will increment the minor version via Git tags/releases. Breaking changes will increment the major version. See Git history and release notes for details.

## Contributing

- Propose changes via pull request with rationale and, where applicable, example payloads.
- Keep OpenAPI and TypeScript interfaces in sync.
- Favor explicit types and self-explanatory naming. Avoid ambiguous or protocol-specific jargon without a definition.

## License

This repository is licensed under the terms of the `LICENSE` file at the root of the repository.