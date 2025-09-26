/**
 * Quotes API TypeScript interfaces
 * Re-exports from centralized types file
 */

export {
  // Common types
  Address,
  Amount,
  SwapType,
  
  // EIP-712 types
  EIP712TypeProperty,
  EIP712Types,
  
  // Quote request types
  Input,
  Output,
  AssetLockReference,
  OriginSubmission,
  QuotePreference,
  FailureHandlingMode,
  GetQuoteRequest,
  
  // Quote response types
  Quote,
  GetQuoteResponse,
  
  // Order types used in quotes
  Order,
  OifEscrowOrder,
  OifResourceLockOrder,
  Oif3009Order,
  OifUserOpenIntentOrder,
} from "./types";
