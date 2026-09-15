import os
from app.database.connection import SessionLocal
from app.models.category import Category
from app.models.product import Product
from app.models.supplier import Supplier, SupplierProduct
from app.models.sales import Customer, Sale, SaleItem
from app.models.purchase import PurchaseOrder, PurchaseOrderItem
from app.models.inventory import Inventory, InventoryTransaction
from app.models.promotion import Promotion

DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "supermarket")

def count_csv_rows(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path): return 0
    with open(path, encoding='utf-8') as f:
        return sum(1 for _ in f) - 1  # -1 for header

def audit():
    db = SessionLocal()
    
    print("--- DATA IMPORT AUDIT ---")
    print(f"Products: CSV {count_csv_rows('01_products.csv')} / DB {db.query(Product).count()}")
    print(f"Stores: CSV {count_csv_rows('02_stores.csv')} / DB (no table)")
    print(f"Suppliers: CSV {count_csv_rows('03_suppliers.csv')} / DB {db.query(Supplier).count()}")
    print(f"Supplier Products: CSV {count_csv_rows('04_supplier_products.csv')} / DB {db.query(SupplierProduct).count()}")
    print(f"Promotions: CSV {count_csv_rows('06_promotions.csv')} / DB {db.query(Promotion).count()}")
    print(f"Sales: CSV {count_csv_rows('07_sales.csv')} / DB Sales: {db.query(Sale).count()}, DB SaleItems: {db.query(SaleItem).count()}")
    print(f"Inventory Daily: CSV {count_csv_rows('08_inventory_daily.csv')} / DB {db.query(Inventory).count()} (unique products)")
    print(f"Purchase Orders: CSV {count_csv_rows('09_purchase_orders.csv')} / DB {db.query(PurchaseOrder).count()}")
    print(f"Purchase Order Items: CSV {count_csv_rows('10_purchase_order_items.csv')} / DB {db.query(PurchaseOrderItem).count()}")
    print(f"Customers: CSV {count_csv_rows('13_customers.csv')} / DB {db.query(Customer).count()}")
    print(f"Inventory Transactions: CSV {count_csv_rows('14_inventory_transactions.csv')} / DB {db.query(InventoryTransaction).count()}")
    print(f"Product Batches: CSV {count_csv_rows('15_product_batches.csv')} / DB (no table)")
    
    db.close()

if __name__ == "__main__":
    audit()
