/**
 * OIF API TypeScript Type Definitions
 * This file contains all type definitions used in the OIF protocol
 */

// ============ Common Types ============

/**
 * EIP-7930 interoperable address
 * @description EIP-7930 interoperable address - plain Ethereum address (0x + 40 hex) or version 1 encoded format (0x0001... with chain+address)
 * @pattern ^0x([a-fA-F0-9]{40}|0001[a-fA-F0-9]+)$
 * @example "0x00010000010114D8DA6BF26964AF9D7EED9E03E53415D37AA96045"
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
 * Order interpretation for swap amounts
 * @description Closed list defining how providers must interpret amounts for swaps. "swap-sell" means exact-input (spend exactly the input amounts). "swap-buy" means exact-output (receive exactly the output amounts). To include more options the API will be extended in the future.
 */
export type OrderType = "swap-buy" | "swap-sell";

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

/**
 * Origin submission preference
 * @description Explicit, forward-compatible preference for who submits the origin transaction and acceptable authorization schemes.
 */
export interface OriginSubmission {
  /** Who submits the origin transaction */
  mode: "user" | "protocol";
  /** Acceptable signing/authorization schemes for interoperability */
  schemes?: Array<"erc-4337" | "permit2" | "erc20-permit" | "eip-3009">;
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
  /** Order type: 'swap-sell' = exact-input, 'swap-buy' = exact-output. If omitted, providers SHOULD assume 'swap-sell' for backward compatibility. */
  orderType?: OrderType;
  /** Minimum validity timestamp in seconds */
  minValidUntil?: number;
  /** Quote preference */
  preference?: QuotePreference;
  /**
   * Explicit preference for submission responsibility and acceptable auth schemes.
   * If provided, takes precedence over the legacy boolean.
   */
  originSubmission?: OriginSubmission;
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

// ============ Order Types ============

/**
 * Request to submit an order
 * @description Request to submit an order
 */
export interface PostOrderRequest {
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
  /** Optional preference mirrored from quote about who submits and acceptable schemes */
  originSubmission?: OriginSubmission;
}

/**
 * Status enum for order submission responses.
 * @description Distinguishes between successful receipt and validation failures at the discovery stage.
 * Note: Full validation (oracle routes, etc.) happens asynchronously after receipt.
 */
export enum PostOrderResponseStatus {
  /** Order received and passed basic validation, queued for full validation */
  Received = "received",
  /** Order rejected due to validation failure */
  Rejected = "rejected",
  /** Order processing encountered an error */
  Error = "error",
}

/**
 * Response from order submission
 * @description Response from order submission
 */
export interface PostOrderResponse {
  /** Assigned order identifier if accepted */
  orderId?: string;
  /** Status of the order submission */
  status: PostOrderResponseStatus;
  /** Optional message for additional details on status */
  message?: string;
  /** The submitted EIP-712 typed data order */
  order?: Record<string, unknown>;
}

/**
 * Order status enum for order tracking
 * @description Tracks the lifecycle of an order from submission through execution
 */
export enum OrderStatus {
  /** Order has been created but not yet prepared */
  Created = "created",
  /** Order is pending execution */
  Pending = "pending",
  /** Order has been executed */
  Executed = "executed",
  /** Order has been settled and is ready to be claimed */
  Settled = "settled",
  /** Order is finalized and complete (after claim confirmation) */
  Finalized = "finalized",
  /** Order execution failed */
  Failed = "failed",
}

/**
 * Asset amount representation using EIP-7930 interoperable address format
 * @description Asset amount representation using EIP-7930 interoperable address format
 */
export interface AssetAmount {
  /** Asset address in EIP-7930 interoperable format */
  asset: Address;
  /** Amount as a string-encoded integer */
  amount: Amount;
}

/**
 * Settlement mechanism types
 * @description Settlement mechanism types
 * TODO: Add lock types to this schema
 */
export enum SettlementType {
  /** Escrow-based settlement */
  Escrow = "escrow",
  /** Resource lock-based settlement */
  ResourceLock = "resourceLock",
}

/**
 * Settlement information for an order
 * @description Settlement information for an order
 */
export interface Settlement {
  /** Settlement mechanism type */
  type: SettlementType;
  /** Settlement-specific data */
  data: Record<string, unknown>;
}

/**
 * Request to get order details
 * @description Request to get order details by ID
 */
export interface GetOrderRequest {
  /** Order identifier */
  id: string;
}

/**
 * Order response for API endpoints
 * @description Complete order information returned by GET /orders/{id}
 */
export interface GetOrderResponse {
  /** Unique identifier for this order */
  id: string;
  /** Current order status */
  status: OrderStatus;
  /** Timestamp when this order was created (Unix timestamp in seconds) */
  createdAt: number;
  /** Timestamp when this order was last updated (Unix timestamp in seconds) */
  updatedAt: number;
  /** Associated quote ID if available */
  quoteId?: string;
  /** Input asset and amount */
  inputAmount: AssetAmount;
  /** Output asset and amount */
  outputAmount: AssetAmount;
  /** Settlement information */
  settlement: Settlement;
  /** Transaction details if order has been executed */
  fillTransaction?: Record<string, unknown>;
}
