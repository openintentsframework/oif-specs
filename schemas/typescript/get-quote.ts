/*
 * Quote API TypeScript interfaces
 * These interfaces model the request/response payloads for the OIF Get Quote API.
 */

export type Address = string; // ERC-7930 interoperable address

export interface AssetLockReference {
  kind: 'the-compact' | 'rhinestone';
  params?: unknown;
}

export interface AvailableInput {
  user: Address;
  asset: Address;
  amount: bigint;
  /** If undefined, the asset is not locked and needs to be escrowed. */
  lock?: AssetLockReference;
}

export interface RequestedOutputRequest {
  /** The recipient of the output asset. */
  receiver: Address;
  asset: Address;
  amount: bigint;
  /** Optional calldata describing how the receiver will consume the output. */
  calldata?: string;
}

export interface RequestedOutputDetails {
  /** The user associated to the output (mirrors response shape). */
  user: Address;
  asset: Address;
  amount: bigint;
  calldata?: string;
}

export type QuotePreference =
  | 'price'
  | 'speed'
  | 'input-priority'
  | 'trust-minimization';

export type OriginSubmissionMode = 'user' | 'protocol';
export type OriginAuthorizationScheme =
  | 'erc-4337'
  | 'permit2'
  | 'erc20-permit'
  | 'eip-3009';

/**
 * Preference for how the origin transaction should be submitted.
 * If omitted, the provider may choose either based on capabilities.
 */
export interface OriginSubmissionPreference {
  /**
   * 'user' means the requester intends to handle origin submission (may pay gas or use their own abstraction).
   * 'protocol' means the requester prefers the protocol/provider to submit (gasless for the user).
   */
  mode: OriginSubmissionMode;
  /** Optional list of acceptable authorization schemes if protocol submission is requested. */
  schemes?: OriginAuthorizationScheme[];
}

export interface GetQuoteRequest {
  user: Address;
  /** Order of inputs is significant if preference is 'input-priority'. */
  availableInputs: AvailableInput[];
  requestedOutputs: RequestedOutputRequest[];
  /** Minimum validity timestamp (seconds). */
  minValidUntil?: number;
  preference?: QuotePreference;
  /** Optional preference indicating whether the user wants protocol-submitted (gasless) execution. */
  originSubmission?: OriginSubmissionPreference;
}

export interface Eip712Order {
  /** Address-like identifier for the domain separator (ERC-7930 interoperable). */
  domain: Address;
  primaryType: string;
  /** Message to be signed and submitted back. */
  message: Record<string, unknown>;
}

export interface QuoteDetails {
  requestedOutputs: RequestedOutputDetails[];
  availableInputs: Array<
    {
      user: Address;
      asset: Address;
      amount: bigint;
      /** If empty, the asset needs to be escrowed. */
      lockType?: 'the-compact';
      // TODO: include lock info structure when standardized across providers
    }
  >;
}

export interface OriginSubmissionPlan {
  /** Mode the provider expects to use for origin submission. */
  mode: OriginSubmissionMode;
  /** Selected authorization scheme if applicable (e.g., when mode is 'protocol'). */
  scheme?: OriginAuthorizationScheme;
}

export interface Quote {
  /** One or more EIP-712 compliant orders. */
  orders: Eip712Order[];
  details: QuoteDetails;
  /** Quote validity timestamp (seconds). */
  validUntil?: number;
  /** Estimated time of arrival (seconds). */
  eta?: number;
  quoteId: string;
  provider: string;
  /** Plan for how origin submission will be handled for this quote. */
  originSubmission?: OriginSubmissionPlan;
}

export interface GetQuoteResponse {
  quotes: Quote[];
}

/*
  Off-chain Get Quote interfaces for OIF protocol.
  These interfaces mirror the OpenAPI schema in specs/offchain/openapi.yaml.
*/

export type Address7930 = string; // erc-7930 interoperable address

export interface AssetLock {
  /** If omitted, asset is not locked and needs to be escrowed */
  kind: 'the-compact' | 'rhinestone';
  /** Parameters depend on lock kind (e.g., lockTag for the-compact) */
  params?: unknown;
}

export interface GetQuoteRequest {
  user: Address7930;
  /** Order of inputs is significant if preference is 'input-priority' */
  availableInputs: Array<{
    user: Address7930;
    asset: Address7930;
    amount: bigint;
    lock?: AssetLock; // If undefined, asset is not locked and needs to be escrowed
  }>; 
  requestedOutputs: Array<{
    receiver: Address7930;
    asset: Address7930;
    amount: bigint;
    /** Optional execution data, interface TBD */
    calldata?: string;
  }>;
  minValidUntil?: number;
  preference?: 'price' | 'speed' | 'input-priority' | 'trust-minimization';
  originSubmission?: {
    mode: 'user' | 'protocol';
    schemes?: Array<'erc-4337' | 'permit2' | 'erc20-permit' | 'eip-3009'>;
  };
}

export interface EIP712OrderEnvelope {
  /** Full EIP-712 compliant order payload */
  domain: string; // erc-7930 interoperable address for domain separator owner/authority
  primaryType: string;
  message: Record<string, unknown>; // to be signed and submitted back
}

export interface GetQuoteResponseQuoteDetails {
  requestedOutputs: Array<{
    user: Address7930;
    asset: Address7930;
    amount: bigint;
    calldata?: string;
  }>;
  availableInputs: Array<{
    user: Address7930;
    asset: Address7930;
    amount: bigint;
    /** If omitted, the asset needs to be escrowed */
    lockType?: 'the-compact';
  }>;
}

export interface GetQuoteResponse {
  quotes: Array<{
    orders: EIP712OrderEnvelope[];
    details: GetQuoteResponseQuoteDetails;
    validUntil?: number;
    eta?: number;
    quoteId: string;
    provider: string;
    originSubmission?: {
      mode: 'user' | 'protocol';
      scheme?: 'erc-4337' | 'permit2' | 'erc20-permit' | 'eip-3009';
    };
  }>;
}


