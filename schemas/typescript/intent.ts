/*
 * Off-chain Intent Submission API TypeScript interfaces
 */

export interface IntentRequest {
  /** EIP-712 typed data for a gasless cross-chain order. */
  order: Record<string, unknown>;
  /** Signature corresponding to the EIP-712 order. */
  signature: Record<string, unknown>;
  /** Optional quote identifier from a prior Get Quote response. */
  quoteId?: string;
  /** Provider identifier. */
  provider: string;
}

export interface IntentResponse {
  /** Assigned order identifier if accepted. */
  orderId?: string;
  /** Human/machine readable status string. */
  status: string;
  /** Optional message for additional details on status. */
  message?: string;
}

/*
  Off-chain Submit Intent interfaces for OIF protocol.
  These interfaces mirror the OpenAPI schema in specs/offchain/openapi.yaml.
*/

export interface IntentRequest {
  /** GaslessCrossChainOrder or equivalent envelope */
  order: Record<string, unknown>;
  /** EIP-712 signature or equivalent */
  signature: Record<string, unknown>;
  quoteId?: string;
  provider: string;
}

export interface IntentResponse {
  orderId?: string;
  status: string;
  message?: string;
}


