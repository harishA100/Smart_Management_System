export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  cost: number;
  unit: string;
  barcode: string;
  supplier: string;
  status: 'active' | 'inactive' | 'discontinued';
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location: string;
  lastRestocked: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export interface SalesRecord {
  id: string;
  date: string;
  productName: string;
  category: string;
  quantity: number;
  revenue: number;
  profit: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  status: 'active' | 'inactive';
  productsSupplied: number;
  lastDelivery: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: number;
}

export interface AIInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'opportunity' | 'prediction';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  timestamp: string;
  actionable: boolean;
}

export interface ForecastData {
  id: string;
  productName: string;
  category: string;
  currentDemand: number;
  predictedDemand: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

export interface DailySales {
  day: string;
  revenue: number;
  orders: number;
}

export interface CategorySales {
  category: string;
  revenue: number;
  percentage: number;
}

export interface InventoryStatusData {
  status: string;
  count: number;
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
}
