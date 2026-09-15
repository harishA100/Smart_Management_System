export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// Enums
export enum TransactionType {
  sale = "sale",
  purchase = "purchase",
  return_ = "return",
  adjustment = "adjustment",
  damaged = "damaged",
  expired = "expired",
  manual = "manual",
}

export enum POStatus {
  draft = "draft",
  pending_approval = "pending_approval",
  approved = "approved",
  rejected = "rejected",
  ordered = "ordered",
  partially_delivered = "partially_delivered",
  delivered = "delivered",
  cancelled = "cancelled",
}

export enum PaymentMethod {
  cash = "cash",
  card = "card",
  upi = "UPI",
  other = "other",
}

export enum SalesChannel {
  store = "store",
  website = "website",
}

// Category
export interface CategoryBase {
  name: string;
  description?: string;
  is_active: boolean;
}

export interface CategoryCreate extends CategoryBase {}

export interface CategoryResponse extends CategoryBase {
  id: number;
  created_at: string;
}

// Product
export interface ProductBase {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category_id: number;
  brand?: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  reorder_level: number;
  maximum_stock_level?: number;
  shelf_life_days?: number;
  is_active: boolean;
}

export interface ProductCreate extends ProductBase {}

export interface ProductUpdate extends Partial<ProductBase> {}

export interface ProductResponse extends ProductBase {
  id: number;
  created_at: string;
  updated_at: string;
  category: CategoryResponse;
}

export interface ProductListResponse {
  products: ProductResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Inventory
export interface StockReceiveRequest {
  quantity: number;
  reference_id?: number;
  notes?: string;
}

export interface StockAdjustmentRequest {
  quantity_change: number;
  notes: string;
}

export interface StockDamageRequest {
  quantity: number;
  notes?: string;
}

export interface StockExpiryRequest {
  quantity: number;
  notes?: string;
}

export interface InventoryResponse {
  product: ProductResponse;
  current_stock: number;
  reserved_stock: number;
  incoming_stock: number;
  damaged_stock: number;
  expired_stock: number;
  available_stock: number;
  reorder_level: number;
  maximum_stock_level?: number;
  stock_status: string;
  updated_at: string;
}

export interface InventoryListResponse {
  inventory: InventoryResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface InventorySummaryResponse {
  total_products: number;
  total_units: number;
  low_stock_products: number;
  out_of_stock_products: number;
  inventory_value: number;
  incoming_units: number;
  damaged_units: number;
  expired_units: number;
}

export interface InventoryTransactionResponse {
  id: number;
  product_id: number;
  transaction_type: TransactionType;
  quantity: number;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  created_at: string;
}

export interface InventoryTransactionListResponse {
  transactions: InventoryTransactionResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Sale
export interface SaleItemCreate {
  product_id: number;
  quantity: number;
  discount?: number;
}

export interface SaleCreate {
  customer_id?: number;
  items: SaleItemCreate[];
  discount?: number;
  tax?: number;
  payment_method: PaymentMethod;
  sales_channel?: SalesChannel;
}

export interface CustomerResponse {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface SaleItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

export interface SaleResponse {
  id: number;
  customer_id?: number;
  invoice_number: string;
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  payment_method: PaymentMethod;
  sales_channel: SalesChannel;
  created_at: string;
  customer?: CustomerResponse;
  sale_items: SaleItemResponse[];
}

export interface SaleListResponse {
  sales: SaleResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SalesSummaryResponse {
  today_sales: number;
  total_orders: number;
  items_sold: number;
  average_order_value: number;
  last_7_days_sales: number;
  last_30_days_sales: number;
  total_revenue: number;
}

// Supplier
export interface SupplierBase {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gst_number?: string;
  payment_terms?: string;
  is_active: boolean;
}

export interface SupplierCreate extends SupplierBase {}

export interface SupplierUpdate extends Partial<SupplierBase> {}

export interface SupplierResponse extends SupplierBase {
  id: number;
  reliability_score?: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierListResponse {
  items: SupplierResponse[];
  total: number;
  page: number;
  page_size: number;
}

// Purchase Order
export interface PurchaseOrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface PurchaseOrderItemResponse {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  received_quantity: number;
  unit_price: number;
  total_price: number;
}

export interface PurchaseOrderCreate {
  supplier_id: number;
  expected_delivery_date?: string;
  notes?: string;
  items: PurchaseOrderItemCreate[];
}

export interface PurchaseOrderResponse {
  id: number;
  po_number: string;
  supplier_id: number;
  supplier_name: string;
  status: POStatus;
  subtotal: number;
  tax: number;
  total_amount: number;
  expected_delivery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: PurchaseOrderItemResponse[];
}

export interface PurchaseOrderListResponse {
  items: PurchaseOrderResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface RejectionReason {
  rejection_reason: string;
}

export interface CancellationReason {
  cancellation_reason: string;
}

export interface PurchaseOrderItemReceive {
  product_id: number;
  received_quantity: number;
}

export interface PurchaseOrderReceive {
  items: PurchaseOrderItemReceive[];
}

export interface PurchaseOrderSummaryResponse {
  total_purchase_orders: number;
  draft_orders: number;
  pending_approval: number;
  approved: number;
  ordered: number;
  partially_delivered: number;
  delivered: number;
  cancelled: number;
  total_purchase_value: number;
  pending_purchase_value: number;
}

// Supplier Products
export interface SupplierProductBase {
  unit_price: number;
  minimum_order_quantity: number;
  lead_time_days?: number;
  quality_score?: number;
  is_preferred: boolean;
}

export interface SupplierProductCreate extends SupplierProductBase {
  product_id: number;
}

export interface SupplierProductUpdate extends Partial<SupplierProductBase> {}

export interface SupplierProductResponse extends SupplierProductBase {
  id: number;
  supplier_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  created_at: string;
  updated_at: string;
}

// Supplier Performance & Comparison
export interface SupplierPerformanceResponse {
  total_purchase_orders: number;
  completed_purchase_orders: number;
  cancelled_orders: number;
  average_delivery_time_days: number;
  average_quality_score: number;
  total_purchase_value: number;
  on_time_delivery_percentage: number;
}

export interface SupplierComparisonItem {
  supplier_id: number;
  supplier_name: string;
  unit_price: number;
  minimum_order_quantity: number;
  lead_time_days?: number;
  quality_score?: number;
  is_preferred: boolean;
  performance: SupplierPerformanceResponse;
}

export interface SupplierComparisonResponse {
  product_id: number;
  suppliers: SupplierComparisonItem[];
}
