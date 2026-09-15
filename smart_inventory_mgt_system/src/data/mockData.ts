import type {
  Product,
  InventoryItem,
  SalesRecord,
  Supplier,
  PurchaseOrder,
  AIInsight,
  ForecastData,
  DailySales,
  CategorySales,
  InventoryStatusData,
  Notification,
} from '../types';

// ─── Products ────────────────────────────────────────────────────────────────

export const mockProducts: Product[] = [
  { id: 'P001', name: 'Organic Whole Milk', category: 'Dairy', sku: 'DAI-001', price: 4.99, cost: 3.20, unit: 'gallon', barcode: '8901234567890', supplier: 'FreshFarms Dairy', status: 'active' },
  { id: 'P002', name: 'Sourdough Bread Loaf', category: 'Bakery', sku: 'BAK-001', price: 5.49, cost: 2.80, unit: 'loaf', barcode: '8901234567891', supplier: 'Artisan Bakeries Co.', status: 'active' },
  { id: 'P003', name: 'Free Range Eggs (12pk)', category: 'Dairy', sku: 'DAI-002', price: 6.99, cost: 4.50, unit: 'dozen', barcode: '8901234567892', supplier: 'FreshFarms Dairy', status: 'active' },
  { id: 'P004', name: 'Atlantic Salmon Fillet', category: 'Seafood', sku: 'SEA-001', price: 12.99, cost: 8.50, unit: 'lb', barcode: '8901234567893', supplier: 'OceanCatch Seafood', status: 'active' },
  { id: 'P005', name: 'Organic Bananas', category: 'Produce', sku: 'PRO-001', price: 1.29, cost: 0.60, unit: 'lb', barcode: '8901234567894', supplier: 'TropiFresh Imports', status: 'active' },
  { id: 'P006', name: 'Extra Virgin Olive Oil', category: 'Pantry', sku: 'PAN-001', price: 8.99, cost: 5.20, unit: 'bottle', barcode: '8901234567895', supplier: 'Mediterranean Foods', status: 'active' },
  { id: 'P007', name: 'Chicken Breast (Boneless)', category: 'Meat', sku: 'MEA-001', price: 7.99, cost: 5.00, unit: 'lb', barcode: '8901234567896', supplier: 'PrimeCut Meats', status: 'active' },
  { id: 'P008', name: 'Greek Yogurt (Plain)', category: 'Dairy', sku: 'DAI-003', price: 3.49, cost: 2.00, unit: 'tub', barcode: '8901234567897', supplier: 'FreshFarms Dairy', status: 'active' },
  { id: 'P009', name: 'Basmati Rice (5kg)', category: 'Pantry', sku: 'PAN-002', price: 9.99, cost: 6.00, unit: 'bag', barcode: '8901234567898', supplier: 'GrainMaster Foods', status: 'active' },
  { id: 'P010', name: 'Fresh Avocados', category: 'Produce', sku: 'PRO-002', price: 1.99, cost: 1.10, unit: 'each', barcode: '8901234567899', supplier: 'TropiFresh Imports', status: 'active' },
  { id: 'P011', name: 'Sparkling Water (12pk)', category: 'Beverages', sku: 'BEV-001', price: 6.49, cost: 3.80, unit: 'pack', barcode: '8901234567900', supplier: 'ClearSpring Beverages', status: 'active' },
  { id: 'P012', name: 'Cheddar Cheese Block', category: 'Dairy', sku: 'DAI-004', price: 5.99, cost: 3.50, unit: 'block', barcode: '8901234567901', supplier: 'FreshFarms Dairy', status: 'active' },
  { id: 'P013', name: 'Frozen Mixed Berries', category: 'Frozen', sku: 'FRO-001', price: 4.49, cost: 2.60, unit: 'bag', barcode: '8901234567902', supplier: 'Arctic Harvest', status: 'active' },
  { id: 'P014', name: 'Organic Baby Spinach', category: 'Produce', sku: 'PRO-003', price: 3.99, cost: 2.20, unit: 'bag', barcode: '8901234567903', supplier: 'GreenLeaf Organics', status: 'active' },
  { id: 'P015', name: 'Peanut Butter (Crunchy)', category: 'Pantry', sku: 'PAN-003', price: 4.29, cost: 2.50, unit: 'jar', barcode: '8901234567904', supplier: 'NutriNut Corp.', status: 'active' },
  { id: 'P016', name: 'Tomato Pasta Sauce', category: 'Pantry', sku: 'PAN-004', price: 3.79, cost: 1.90, unit: 'jar', barcode: '8901234567905', supplier: 'Mediterranean Foods', status: 'active' },
  { id: 'P017', name: 'Orange Juice (Fresh)', category: 'Beverages', sku: 'BEV-002', price: 4.99, cost: 2.80, unit: 'carton', barcode: '8901234567906', supplier: 'ClearSpring Beverages', status: 'active' },
  { id: 'P018', name: 'Ground Coffee (Medium)', category: 'Beverages', sku: 'BEV-003', price: 11.99, cost: 7.00, unit: 'bag', barcode: '8901234567907', supplier: 'BeanCraft Roasters', status: 'active' },
  { id: 'P019', name: 'Whole Wheat Tortillas', category: 'Bakery', sku: 'BAK-002', price: 3.99, cost: 2.10, unit: 'pack', barcode: '8901234567908', supplier: 'Artisan Bakeries Co.', status: 'active' },
  { id: 'P020', name: 'Almond Milk (Unsweetened)', category: 'Dairy', sku: 'DAI-005', price: 3.99, cost: 2.30, unit: 'carton', barcode: '8901234567909', supplier: 'NutriNut Corp.', status: 'inactive' },
];

// ─── Inventory ───────────────────────────────────────────────────────────────

export const mockInventory: InventoryItem[] = [
  { id: 'INV001', productId: 'P001', productName: 'Organic Whole Milk', category: 'Dairy', currentStock: 245, minStock: 50, maxStock: 400, unit: 'gallons', location: 'Aisle 3 - Cold Storage', lastRestocked: '2026-09-12', status: 'in-stock' },
  { id: 'INV002', productId: 'P002', productName: 'Sourdough Bread Loaf', category: 'Bakery', currentStock: 82, minStock: 30, maxStock: 150, unit: 'loaves', location: 'Aisle 1 - Bakery', lastRestocked: '2026-09-13', status: 'in-stock' },
  { id: 'INV003', productId: 'P003', productName: 'Free Range Eggs (12pk)', category: 'Dairy', currentStock: 18, minStock: 40, maxStock: 200, unit: 'dozens', location: 'Aisle 3 - Cold Storage', lastRestocked: '2026-09-08', status: 'low-stock' },
  { id: 'INV004', productId: 'P004', productName: 'Atlantic Salmon Fillet', category: 'Seafood', currentStock: 0, minStock: 15, maxStock: 80, unit: 'lbs', location: 'Aisle 5 - Seafood Counter', lastRestocked: '2026-09-05', status: 'out-of-stock' },
  { id: 'INV005', productId: 'P005', productName: 'Organic Bananas', category: 'Produce', currentStock: 340, minStock: 100, maxStock: 500, unit: 'lbs', location: 'Aisle 2 - Produce', lastRestocked: '2026-09-14', status: 'in-stock' },
  { id: 'INV006', productId: 'P006', productName: 'Extra Virgin Olive Oil', category: 'Pantry', currentStock: 56, minStock: 20, maxStock: 120, unit: 'bottles', location: 'Aisle 7 - Oils & Vinegars', lastRestocked: '2026-09-10', status: 'in-stock' },
  { id: 'INV007', productId: 'P007', productName: 'Chicken Breast (Boneless)', category: 'Meat', currentStock: 12, minStock: 25, maxStock: 100, unit: 'lbs', location: 'Aisle 4 - Meat Counter', lastRestocked: '2026-09-11', status: 'low-stock' },
  { id: 'INV008', productId: 'P008', productName: 'Greek Yogurt (Plain)', category: 'Dairy', currentStock: 178, minStock: 50, maxStock: 300, unit: 'tubs', location: 'Aisle 3 - Cold Storage', lastRestocked: '2026-09-13', status: 'in-stock' },
  { id: 'INV009', productId: 'P009', productName: 'Basmati Rice (5kg)', category: 'Pantry', currentStock: 92, minStock: 30, maxStock: 200, unit: 'bags', location: 'Aisle 8 - Grains', lastRestocked: '2026-09-07', status: 'in-stock' },
  { id: 'INV010', productId: 'P010', productName: 'Fresh Avocados', category: 'Produce', currentStock: 8, minStock: 30, maxStock: 150, unit: 'units', location: 'Aisle 2 - Produce', lastRestocked: '2026-09-09', status: 'low-stock' },
  { id: 'INV011', productId: 'P011', productName: 'Sparkling Water (12pk)', category: 'Beverages', currentStock: 210, minStock: 60, maxStock: 350, unit: 'packs', location: 'Aisle 10 - Beverages', lastRestocked: '2026-09-12', status: 'in-stock' },
  { id: 'INV012', productId: 'P012', productName: 'Cheddar Cheese Block', category: 'Dairy', currentStock: 0, minStock: 20, maxStock: 100, unit: 'blocks', location: 'Aisle 3 - Cold Storage', lastRestocked: '2026-09-01', status: 'out-of-stock' },
  { id: 'INV013', productId: 'P013', productName: 'Frozen Mixed Berries', category: 'Frozen', currentStock: 145, minStock: 40, maxStock: 250, unit: 'bags', location: 'Aisle 9 - Frozen', lastRestocked: '2026-09-11', status: 'in-stock' },
  { id: 'INV014', productId: 'P014', productName: 'Organic Baby Spinach', category: 'Produce', currentStock: 5, minStock: 25, maxStock: 120, unit: 'bags', location: 'Aisle 2 - Produce', lastRestocked: '2026-09-06', status: 'low-stock' },
  { id: 'INV015', productId: 'P015', productName: 'Peanut Butter (Crunchy)', category: 'Pantry', currentStock: 67, minStock: 20, maxStock: 100, unit: 'jars', location: 'Aisle 7 - Spreads', lastRestocked: '2026-09-09', status: 'in-stock' },
];

// ─── Sales ───────────────────────────────────────────────────────────────────

export const mockSales: SalesRecord[] = [
  { id: 'S001', date: '2026-09-14', productName: 'Organic Whole Milk', category: 'Dairy', quantity: 48, revenue: 239.52, profit: 85.92 },
  { id: 'S002', date: '2026-09-14', productName: 'Sourdough Bread Loaf', category: 'Bakery', quantity: 35, revenue: 192.15, profit: 94.15 },
  { id: 'S003', date: '2026-09-14', productName: 'Free Range Eggs (12pk)', category: 'Dairy', quantity: 22, revenue: 153.78, profit: 54.78 },
  { id: 'S004', date: '2026-09-14', productName: 'Organic Bananas', category: 'Produce', quantity: 120, revenue: 154.80, profit: 82.80 },
  { id: 'S005', date: '2026-09-14', productName: 'Chicken Breast (Boneless)', category: 'Meat', quantity: 45, revenue: 359.55, profit: 134.55 },
  { id: 'S006', date: '2026-09-13', productName: 'Greek Yogurt (Plain)', category: 'Dairy', quantity: 60, revenue: 209.40, profit: 89.40 },
  { id: 'S007', date: '2026-09-13', productName: 'Atlantic Salmon Fillet', category: 'Seafood', quantity: 18, revenue: 233.82, profit: 80.82 },
  { id: 'S008', date: '2026-09-13', productName: 'Extra Virgin Olive Oil', category: 'Pantry', quantity: 15, revenue: 134.85, profit: 56.85 },
  { id: 'S009', date: '2026-09-13', productName: 'Ground Coffee (Medium)', category: 'Beverages', quantity: 28, revenue: 335.72, profit: 139.72 },
  { id: 'S010', date: '2026-09-12', productName: 'Fresh Avocados', category: 'Produce', quantity: 85, revenue: 169.15, profit: 75.65 },
  { id: 'S011', date: '2026-09-12', productName: 'Basmati Rice (5kg)', category: 'Pantry', quantity: 20, revenue: 199.80, profit: 79.80 },
  { id: 'S012', date: '2026-09-12', productName: 'Sparkling Water (12pk)', category: 'Beverages', quantity: 42, revenue: 272.58, profit: 112.98 },
  { id: 'S013', date: '2026-09-11', productName: 'Frozen Mixed Berries', category: 'Frozen', quantity: 30, revenue: 134.70, profit: 56.70 },
  { id: 'S014', date: '2026-09-11', productName: 'Organic Baby Spinach', category: 'Produce', quantity: 55, revenue: 219.45, profit: 120.45 },
  { id: 'S015', date: '2026-09-11', productName: 'Peanut Butter (Crunchy)', category: 'Pantry', quantity: 25, revenue: 107.25, profit: 44.75 },
];

// ─── Suppliers ───────────────────────────────────────────────────────────────

export const mockSuppliers: Supplier[] = [
  { id: 'SUP001', name: 'FreshFarms Dairy', contactPerson: 'Sarah Mitchell', email: 'sarah@freshfarms.com', phone: '+1 (555) 234-5678', address: '450 Dairy Lane, Madison, WI 53703', rating: 4.8, status: 'active', productsSupplied: 12, lastDelivery: '2026-09-13' },
  { id: 'SUP002', name: 'Artisan Bakeries Co.', contactPerson: 'James Wilson', email: 'james@artisanbakeries.com', phone: '+1 (555) 345-6789', address: '78 Baker Street, Portland, OR 97201', rating: 4.5, status: 'active', productsSupplied: 8, lastDelivery: '2026-09-13' },
  { id: 'SUP003', name: 'OceanCatch Seafood', contactPerson: 'Maria Santos', email: 'maria@oceancatch.com', phone: '+1 (555) 456-7890', address: '12 Harbor Drive, Seattle, WA 98101', rating: 4.2, status: 'active', productsSupplied: 6, lastDelivery: '2026-09-10' },
  { id: 'SUP004', name: 'TropiFresh Imports', contactPerson: 'Carlos Rivera', email: 'carlos@tropifresh.com', phone: '+1 (555) 567-8901', address: '300 Import Blvd, Miami, FL 33101', rating: 4.6, status: 'active', productsSupplied: 15, lastDelivery: '2026-09-14' },
  { id: 'SUP005', name: 'Mediterranean Foods', contactPerson: 'Elena Rossi', email: 'elena@medfoodco.com', phone: '+1 (555) 678-9012', address: '92 Olive Way, San Francisco, CA 94102', rating: 4.4, status: 'active', productsSupplied: 10, lastDelivery: '2026-09-11' },
  { id: 'SUP006', name: 'PrimeCut Meats', contactPerson: 'Robert Johnson', email: 'robert@primecut.com', phone: '+1 (555) 789-0123', address: '55 Ranch Road, Omaha, NE 68101', rating: 4.7, status: 'active', productsSupplied: 9, lastDelivery: '2026-09-12' },
  { id: 'SUP007', name: 'GreenLeaf Organics', contactPerson: 'Amy Chen', email: 'amy@greenleaf.com', phone: '+1 (555) 890-1234', address: '180 Farm Circle, Sacramento, CA 95814', rating: 4.3, status: 'active', productsSupplied: 20, lastDelivery: '2026-09-09' },
  { id: 'SUP008', name: 'ClearSpring Beverages', contactPerson: 'David Park', email: 'david@clearspring.com', phone: '+1 (555) 901-2345', address: '410 Spring Ave, Denver, CO 80201', rating: 4.1, status: 'active', productsSupplied: 14, lastDelivery: '2026-09-12' },
  { id: 'SUP009', name: 'GrainMaster Foods', contactPerson: 'Priya Sharma', email: 'priya@grainmaster.com', phone: '+1 (555) 012-3456', address: '67 Wheat Field Rd, Kansas City, MO 64101', rating: 4.0, status: 'inactive', productsSupplied: 7, lastDelivery: '2026-08-28' },
  { id: 'SUP010', name: 'Arctic Harvest', contactPerson: 'Erik Johansen', email: 'erik@arcticharv.com', phone: '+1 (555) 123-4567', address: '205 Glacier Pkwy, Anchorage, AK 99501', rating: 3.9, status: 'active', productsSupplied: 5, lastDelivery: '2026-09-11' },
];

// ─── Purchase Orders ─────────────────────────────────────────────────────────

export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'PO001', orderNumber: 'PO-2026-0142', supplier: 'FreshFarms Dairy', orderDate: '2026-09-10', expectedDelivery: '2026-09-15', status: 'shipped', totalAmount: 4250.00, items: 5 },
  { id: 'PO002', orderNumber: 'PO-2026-0143', supplier: 'OceanCatch Seafood', orderDate: '2026-09-11', expectedDelivery: '2026-09-16', status: 'approved', totalAmount: 2800.00, items: 3 },
  { id: 'PO003', orderNumber: 'PO-2026-0144', supplier: 'TropiFresh Imports', orderDate: '2026-09-12', expectedDelivery: '2026-09-17', status: 'pending', totalAmount: 1950.00, items: 8 },
  { id: 'PO004', orderNumber: 'PO-2026-0145', supplier: 'PrimeCut Meats', orderDate: '2026-09-12', expectedDelivery: '2026-09-16', status: 'shipped', totalAmount: 3600.00, items: 4 },
  { id: 'PO005', orderNumber: 'PO-2026-0146', supplier: 'GreenLeaf Organics', orderDate: '2026-09-13', expectedDelivery: '2026-09-18', status: 'pending', totalAmount: 1420.00, items: 6 },
  { id: 'PO006', orderNumber: 'PO-2026-0147', supplier: 'Mediterranean Foods', orderDate: '2026-09-13', expectedDelivery: '2026-09-19', status: 'approved', totalAmount: 2100.00, items: 4 },
  { id: 'PO007', orderNumber: 'PO-2026-0138', supplier: 'Artisan Bakeries Co.', orderDate: '2026-09-06', expectedDelivery: '2026-09-10', status: 'delivered', totalAmount: 1680.00, items: 3 },
  { id: 'PO008', orderNumber: 'PO-2026-0135', supplier: 'ClearSpring Beverages', orderDate: '2026-09-03', expectedDelivery: '2026-09-08', status: 'delivered', totalAmount: 3200.00, items: 7 },
  { id: 'PO009', orderNumber: 'PO-2026-0148', supplier: 'Arctic Harvest', orderDate: '2026-09-14', expectedDelivery: '2026-09-20', status: 'pending', totalAmount: 890.00, items: 2 },
  { id: 'PO010', orderNumber: 'PO-2026-0130', supplier: 'GrainMaster Foods', orderDate: '2026-08-28', expectedDelivery: '2026-09-02', status: 'cancelled', totalAmount: 1350.00, items: 3 },
];

// ─── AI Insights ─────────────────────────────────────────────────────────────

export const mockAIInsights: AIInsight[] = [
  { id: 'AI001', type: 'warning', title: 'Stock-out Risk: Atlantic Salmon', description: 'Atlantic Salmon Fillet is currently out of stock. Based on historical demand patterns, this will result in an estimated revenue loss of $1,400/week. Immediate reorder recommended.', impact: 'high', category: 'Inventory', timestamp: '2026-09-14T10:30:00Z', actionable: true },
  { id: 'AI002', type: 'recommendation', title: 'Optimize Dairy Reorder Schedule', description: 'Analysis shows dairy products are being restocked 2 days earlier than optimal. Adjusting the reorder point from 50 to 35 units could reduce holding costs by 12% without increasing stock-out risk.', impact: 'medium', category: 'Procurement', timestamp: '2026-09-14T09:15:00Z', actionable: true },
  { id: 'AI003', type: 'opportunity', title: 'Weekend Demand Surge: Organic Produce', description: 'Organic produce sales increase by 34% on weekends. Consider increasing Friday restocking quantities by 40% to capture this demand. Estimated additional revenue: $820/month.', impact: 'high', category: 'Sales', timestamp: '2026-09-14T08:00:00Z', actionable: true },
  { id: 'AI004', type: 'prediction', title: 'Seasonal Trend: Holiday Baking Supplies', description: 'Based on 3-year historical data, demand for baking supplies will increase by 180% starting October 15. Begin building inventory buffers for flour, sugar, butter, and eggs by October 1.', impact: 'high', category: 'Forecasting', timestamp: '2026-09-13T16:45:00Z', actionable: true },
  { id: 'AI005', type: 'warning', title: 'Supplier Reliability Alert: GrainMaster', description: 'GrainMaster Foods has missed 3 of the last 5 delivery deadlines, with an average delay of 2.3 days. Consider diversifying grain suppliers or negotiating improved SLAs.', impact: 'medium', category: 'Suppliers', timestamp: '2026-09-13T14:20:00Z', actionable: true },
  { id: 'AI006', type: 'recommendation', title: 'Price Optimization: Sparkling Water', description: 'Competitive analysis indicates sparkling water is priced 8% above market average. A 5% price reduction could increase volume by 22% while maintaining overall profitability.', impact: 'medium', category: 'Pricing', timestamp: '2026-09-13T11:00:00Z', actionable: true },
  { id: 'AI007', type: 'opportunity', title: 'Cross-sell: Coffee & Bakery Bundle', description: 'Customers who purchase ground coffee buy bakery items 67% of the time. Creating a "Morning Essentials" bundle could increase basket size by an estimated $3.50 per transaction.', impact: 'low', category: 'Sales', timestamp: '2026-09-12T15:30:00Z', actionable: true },
  { id: 'AI008', type: 'prediction', title: 'Avocado Price Drop Expected', description: 'Market indicators suggest avocado wholesale prices will drop 15-20% in the next 2 weeks due to seasonal harvest peaks. Recommend delaying large orders by 1 week.', impact: 'medium', category: 'Procurement', timestamp: '2026-09-12T10:00:00Z', actionable: true },
];

// ─── Forecasts ───────────────────────────────────────────────────────────────

export const mockForecasts: ForecastData[] = [
  { id: 'F001', productName: 'Organic Whole Milk', category: 'Dairy', currentDemand: 48, predictedDemand: 52, confidence: 92, trend: 'up', period: 'Next 7 Days' },
  { id: 'F002', productName: 'Sourdough Bread Loaf', category: 'Bakery', currentDemand: 35, predictedDemand: 38, confidence: 88, trend: 'up', period: 'Next 7 Days' },
  { id: 'F003', productName: 'Free Range Eggs (12pk)', category: 'Dairy', currentDemand: 22, predictedDemand: 30, confidence: 85, trend: 'up', period: 'Next 7 Days' },
  { id: 'F004', productName: 'Atlantic Salmon Fillet', category: 'Seafood', currentDemand: 18, predictedDemand: 15, confidence: 78, trend: 'down', period: 'Next 7 Days' },
  { id: 'F005', productName: 'Organic Bananas', category: 'Produce', currentDemand: 120, predictedDemand: 118, confidence: 94, trend: 'stable', period: 'Next 7 Days' },
  { id: 'F006', productName: 'Chicken Breast (Boneless)', category: 'Meat', currentDemand: 45, predictedDemand: 55, confidence: 82, trend: 'up', period: 'Next 7 Days' },
  { id: 'F007', productName: 'Greek Yogurt (Plain)', category: 'Dairy', currentDemand: 60, predictedDemand: 58, confidence: 90, trend: 'stable', period: 'Next 7 Days' },
  { id: 'F008', productName: 'Extra Virgin Olive Oil', category: 'Pantry', currentDemand: 15, predictedDemand: 14, confidence: 86, trend: 'stable', period: 'Next 7 Days' },
  { id: 'F009', productName: 'Ground Coffee (Medium)', category: 'Beverages', currentDemand: 28, predictedDemand: 35, confidence: 80, trend: 'up', period: 'Next 7 Days' },
  { id: 'F010', productName: 'Fresh Avocados', category: 'Produce', currentDemand: 85, predictedDemand: 72, confidence: 75, trend: 'down', period: 'Next 7 Days' },
];

// ─── Dashboard Charts ────────────────────────────────────────────────────────

export const mockDailySales: DailySales[] = [
  { day: 'Mon', revenue: 12400, orders: 342 },
  { day: 'Tue', revenue: 11800, orders: 318 },
  { day: 'Wed', revenue: 13200, orders: 365 },
  { day: 'Thu', revenue: 12600, orders: 348 },
  { day: 'Fri', revenue: 15800, orders: 425 },
  { day: 'Sat', revenue: 18200, orders: 498 },
  { day: 'Sun', revenue: 16400, orders: 456 },
];

export const mockCategorySales: CategorySales[] = [
  { category: 'Dairy', revenue: 18500, percentage: 22 },
  { category: 'Produce', revenue: 15200, percentage: 18 },
  { category: 'Meat', revenue: 13800, percentage: 16 },
  { category: 'Beverages', revenue: 11400, percentage: 13 },
  { category: 'Bakery', revenue: 9600, percentage: 11 },
  { category: 'Pantry', revenue: 8200, percentage: 10 },
  { category: 'Seafood', revenue: 5100, percentage: 6 },
  { category: 'Frozen', revenue: 3200, percentage: 4 },
];

export const mockInventoryStatus: InventoryStatusData[] = [
  { status: 'In Stock', count: 842, color: '#22c55e' },
  { status: 'Low Stock', count: 56, color: '#f59e0b' },
  { status: 'Out of Stock', count: 12, color: '#ef4444' },
];

// ─── Notifications ───────────────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  { id: 'N001', title: 'Stock Alert', message: 'Atlantic Salmon Fillet is out of stock', type: 'error', timestamp: '2026-09-14T10:30:00Z', read: false },
  { id: 'N002', title: 'Order Shipped', message: 'PO-2026-0142 from FreshFarms Dairy has shipped', type: 'info', timestamp: '2026-09-14T09:15:00Z', read: false },
  { id: 'N003', title: 'Low Stock Warning', message: 'Fresh Avocados stock below minimum threshold', type: 'warning', timestamp: '2026-09-14T08:45:00Z', read: false },
  { id: 'N004', title: 'AI Insight', message: 'New demand forecast available for next week', type: 'info', timestamp: '2026-09-13T16:00:00Z', read: true },
  { id: 'N005', title: 'Order Delivered', message: 'PO-2026-0138 has been delivered successfully', type: 'success', timestamp: '2026-09-13T14:30:00Z', read: true },
];

// ─── Dashboard Summary ──────────────────────────────────────────────────────

export const dashboardSummary = {
  totalProducts: 248,
  totalInventory: 15420,
  lowStockItems: 56,
  stockOutRisk: 12,
  todayRevenue: 18247.50,
  weeklyRevenue: 100400,
  monthlyRevenue: 412800,
  avgOrderValue: 42.30,
};
