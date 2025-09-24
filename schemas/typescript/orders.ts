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
  OifGenericOrder,
  
  // Order status and details
  OrderStatus,
  AssetAmount,
  Settlement,
  SettlementType,
  
  // Common types
  Address,
  Amount,
  OriginSubmission,
  FailureHandlingMode,
} from "./types";
