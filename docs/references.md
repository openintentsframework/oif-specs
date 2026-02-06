### External references: related APIs and intent protocols

Below is a curated list of external APIs and docs that are relevant to OIF's quote and intent standards. These are for inspiration and comparison; they are not normative for OIF.

## Chain and Address Standards

- CAIP-2 — Chain ID Specification: `https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md`
  - Focus: blockchain-agnostic chain identifier format
  - Relevance: OIF uses CAIP-2 for the `chain` field in addresses (e.g., `eip155:1`)

- CAIP-10 — Account ID Specification: `https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md`
  - Focus: blockchain-agnostic account identifier format
  - Relevance: combines chain and address into a single identifier string

- CAIP-350 — Text Identifiers for Chain-Specific Addresses: `https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-350.md`
  - Focus: specifying deterministic and unambiguous conversions between text and binary formats for Addresses and Chain References across different blockchain ecosystems
  - Relevance: OIF API uses CAIP-350's text representations for chain identifiers and addresses to identify tokens and accounts on specific chains

- ERC-7930 — Interoperable Addresses: `https://eips.ethereum.org/EIPS/eip-7930`
  - Focus: compact binary chain-specific address format
  - Note: Used by oif-contracts for on-chain representation; solvers handle conversion from CAIP-350 text format

## Intent and Quote APIs

- Across Protocol — API Reference: `https://docs.across.to/reference/api-reference#api-endpoints`
  - Focus: cross-chain bridge quotes, relays, fees and ETA
  - Relevance: quote semantics, response fields (validity, fees, timing)
  
- CoW Protocol — Orderbook API: `https://docs.cow.fi/cow-protocol/reference/apis/orderbook`
  - Focus: orderbook API, EIP-712 signing, solver-based settlement
  - Relevance: signed orders, typed data, quote-to-order lifecycle

- Relay — Get Quote API: `https://docs.relay.link/references/api/get-quote`
  - Focus: cross-chain quote retrieval for intents
  - Relevance: quoting, provider identity, validity windows

- Stargate — Transfer Quotes API: `https://docs.stargate.finance/developers/api-docs/transfer-quotes`
  - Focus: bridging transfer quotes
  - Note: may be less aligned with generic intent flows but useful for quoting patterns

- LI.FI Catalyst — Intents API: reference link pending
  - If you have a canonical public URL, please open a PR to add it here.
