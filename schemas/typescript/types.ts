/**
 * OIF API TypeScript Type Definitions
 * This file contains all type definitions used in the OIF protocol
 */

// ============ Common Types ============

/**
 * ERC-7930 interoperable address
 * @description ERC-7930 interoperable address format (address@chain#checksum or plain Ethereum address)
 * @pattern ^0x[a-fA-F0-9]{40}(@eip155:[0-9]+#[a-fA-F0-9]{8})?$
 * @example "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045@eip155:1#4CA88C9C"
 */
export type Address = string;

/**
 * Integer encoded as a string to preserve precision (e.g., uint256)
 * @description Integer encoded as a string to preserve precision (e.g., uint256)
 * @pattern ^[0-9]+$
 * @example "1000000000000000000"
 */
export type Amount = string;

/**
 * Reference to a lock in a locking system
 * @description Reference to a lock in a locking system
 */
export interface AssetLockReference {
  /** Lock type identifier */
  kind: "the-compact" | "rhinestone";
  /** Lock-specific parameters */
  params?: Record<string, unknown>;
}

// ============ Quote Types ============

/**
 * Available input from a user
 * @description Available input from a user
 */
export interface AvailableInput {
  /** User address */
  user: Address;
  /** Asset address */
  asset: Address;
  /** Amount available */
  amount: Amount;
  /** Optional lock reference */
  lock?: AssetLockReference;
}

/**
 * Requested output for a receiver
 * @description Requested output for a receiver
 */
export interface RequestedOutput {
  /** Receiver address */
  receiver: Address;
  /** Asset address */
  asset: Address;
  /** Amount requested */
  amount: Amount;
  /** Optional calldata describing how the receiver will consume the output */
  calldata?: string;
}

/**
 * Detailed information about requested outputs
 * @description Detailed information about requested outputs
 */
export interface RequestedOutputDetails {
  /** User address */
  user: Address;
  /** Asset address */
  asset: Address;
  /** Amount requested */
  amount: Amount;
  /** Optional calldata */
  calldata?: string;
}

/**
 * Quote preference type
 * @description Quote preference type
 */
export type QuotePreference =
  | "price"
  | "speed"
  | "input-priority"
  | "trust-minimization";

/**
 * Failure handling policy. For backward compatibility, simple modes can be
 * provided as a string. To express partial fills in combination with a
 * remainder policy, use the object form.
 */
export type FailureHandlingMode =
  | "retry"
  | "refund-instant"
  | "refund-claim"
  | "needs-new-signature";

export type FailureHandling =
  | FailureHandlingMode
  | {
      /** Whether partial execution may occur. Defaults to false if omitted. */
      partialFill?: boolean;
      /** How the missing portion is handled if a partial fill occurs. */
      remainder: FailureHandlingMode;
    };

/**
 * Request for generating quotes
 * @description Request for generating quotes
 */
export interface GetQuoteRequest {
  /** User requesting the quote */
  user: Address;
  /** Available inputs for the quote. Order is significant if preference is 'input-priority' */
  availableInputs: AvailableInput[];
  /** Requested outputs for the quote */
  requestedOutputs: RequestedOutput[];
  /** Minimum validity timestamp in seconds */
  minValidUntil?: number;
  /** Quote preference */
  preference?: QuotePreference;
  /** If true, request the filler to perform the open on the source chain (may entail additional gas fees). */
  fillerPerformsOpen?: boolean;
}

/**
 * EIP-712 typed data for execution
 * @description EIP-712 typed data for execution
 */
export interface Eip712Order {
  /** Domain for the EIP-712 order */
  domain: Address;
  /** Primary type of the EIP-712 message */
  primaryType: string;
  /** EIP-712 message content */
  message: Record<string, unknown>;
}

/**
 * Detailed information about a quote
 * @description Detailed information about a quote
 */
export interface QuoteDetails {
  /** Requested outputs in the quote */
  requestedOutputs: RequestedOutputDetails[];
  /** Available inputs in the quote */
  availableInputs: Array<{
    /** User address */
    user: Address;
    /** Asset address */
    asset: Address;
    /** Amount available */
    amount: Amount;
    /** Lock type - if empty, the asset needs to be escrowed */
    lockType?: "the-compact";
  }>;
}

/**
 * Quote information
 * @description Quote information
 */
export interface Quote {
  /** EIP-712 orders for execution */
  orders: Eip712Order[];
  /** Quote details */
  details: QuoteDetails;
  /** Quote validity timestamp in seconds */
  validUntil?: number;
  /** Estimated time of arrival in seconds */
  eta?: number;
  /** Unique quote identifier */
  quoteId: string;
  /** Provider identifier */
  provider: string;
}

/**
 * Response containing generated quotes
 * @description Response containing generated quotes
 */
export interface GetQuoteResponse {
  /** Array of generated quotes */
  quotes: Quote[];
}

// ============ Intent Types ============

/**
 * Request to submit an intent
 * @description Request to submit an intent
 */
export interface IntentRequest {
  /** EIP-712 typed data for a gasless cross-chain order */
  order: Record<string, unknown>;
  /** EIP-712 signature or equivalent */
  signature: Record<string, unknown>;
  /** Optional quote identifier from a prior Get Quote response */
  quoteId?: string;
  /** Provider identifier */
  provider: string;
  /** Failure handling policy for execution */
  failureHandling: FailureHandling;
}

/**
 * Response from intent submission
 * @description Response from intent submission
 */
export interface IntentResponse {
  /** Assigned order identifier if accepted */
  orderId?: string;
  /** Human/machine readable status string */
  status: string;
  /** Optional message for additional details on status */
  message?: string;
  /** The submitted EIP-712 typed data order */
  order?: Record<string, unknown>;
}
