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
 * Swap type interpretation for swap amounts
 * @description Closed list defining how providers must interpret amounts for swaps. "swap-sell" means exact-input (spend exactly the input amounts). "swap-buy" means exact-output (receive exactly the output amounts). To include more options the API will be extended in the future.
 */
export type SwapType = "exact-input" | "exact-output";

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
export interface Input {
  /** User address */
  user: Address;
  /** Asset address */
  asset: Address;
  /** Amount available. For exact-output orders, this is the minimum amount to send. */
  amount?: Amount;
  /** Optional lock reference */
  lock?: AssetLockReference;
}

/**
 * Requested output for a receiver
 * @description Requested output for a receiver
 */
export interface Output {
  /** Receiver address */
  receiver: Address;
  /** Asset address */
  asset: Address;
  /** Amount requested. For exact-input orders, this is the minimum amount to receive. */
  amount?: Amount;
  /** Optional calldata describing how the receiver will consume the output */
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
  | "refund-automatic"
  | "refund-claim"
  | "needs-new-signature";

/**
 * Request for generating quotes
 * @description Request for generating quotes
 */
export interface GetQuoteRequest {
  /** User requesting the quote */
  user: Address;

  intent: {
    intentType: "oif-swap";
    /** Available inputs for the quote. Order is significant if preference is 'input-priority' */
    inputs: Input[];
    /** Requested outputs for the quote */
    outputs: Output[];
    /** Swap type: If omitted, providers SHOULD assume 'exact-input'. */
    swapType?: SwapType;
    /** Minimum validity timestamp in seconds */
    minValidUntil?: number;
    /** Quote preference */
    preference?: QuotePreference;
    /**
     * Explicit preference for submission responsibility and acceptable auth schemes.
     * If provided, takes precedence over the legacy boolean.
     */
    originSubmission?: OriginSubmission;

    /** Failure handling policy for execution that the integrator supports*/
    failureHandling?: FailureHandlingMode[];
    /** Whether the integrator supports partial fills */
    partialFill?: boolean;
  }
  supportedTypes: string[]; // Order types supported by the provider
}


export type Order = OifEscrowOrder | OifResourceLockOrder | Oif3009Order | OifGenericOrder

export interface OifEscrowOrder {
  type: "oif-escrow-v0";
  payload: {
    signatureType: "eip712";
    domain: object;
    primaryType: string;
    message: object;
  }
}
export interface OifResourceLockOrder {
  type: "oif-resource-lock-v0";
  payload: {
    signatureType: "eip712";
    domain: object;
    primaryType: string;
    message: object;
  }
}

// metadata included to verify against the nonce (hash of the order)
export interface Oif3009Order {
  type: "oif-3009-v0";
  payload: {
    signatureType: "eip712";
    domain: object;
    primaryType: string;
    message: object;
  };
  metadata: object;
}
export interface OifGenericOrder {
  type: "oif-generic-v0";
  payload: object;
}


/**
 * Quote information
 * @description Quote information
 */
export interface Quote {

  order: Order;

  /** Quote validity timestamp in seconds */
  validUntil?: number;
  /** Estimated time of arrival in seconds */
  eta?: number;
  /** Unique quote identifier */
  quoteId?: string;
  /** Provider identifier */
  provider?: string;
  /** Failure handling policy for execution*/
  failureHandling: FailureHandlingMode;
  /** Whether the quote supports partial fills */
  partialFill: boolean;
}

/**
 * Response containing generated quotes
 * @description Response containing generated quotes
 */
export interface GetQuoteResponse {
  /** Array of generated quotes */
  quotes: Quote[];

}


/**
 * Request to submit an order
 * @description Request to submit an order
 */
export interface PostOrderRequest {
  /** EIP-712 typed data for a gasless cross-chain order */
  order: Order;
  /** EIP-712 signature or equivalent */
  signature: Uint8Array[]; // bytes array in solidity
  /** Optional quote identifier from a prior Get Quote response */
  quoteId?: string;
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
  amount?: Amount;
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
