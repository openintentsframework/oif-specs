/**
 * Orders API TypeScript interfaces
 * Re-exports from centralized types file
 */

export {
  // Order submission types
  PostOrderRequest,
  PostOrderResponse,
  PostOrderResponseStatus,
  
  // Order retrieval types
  GetOrderRequest,
  GetOrderResponse,
  
  // Order types
  Order,
  OifEscrowOrder,
  OifResourceLockOrder,
  Oif3009Order,
  
  // Order status and details
  OrderStatus,
  AssetAmount,
  Settlement,
  SettlementType,
  
  // Common types - CAIP-350 address format
  Chain,
  NativeAddress,
  ChainAddress,
  Amount,
  OriginSubmission,
  FailureHandlingMode,
} from "./types";
