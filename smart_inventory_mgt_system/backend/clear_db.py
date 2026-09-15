from app.database.connection import engine, Base
from app.models.product import Product
from app.models.category import Category
from app.models.sales import Sale, SaleItem, Customer
from app.models.inventory import InventoryTransaction, Inventory
from app.models.supplier import Supplier, SupplierProduct
from app.models.purchase import PurchaseOrder, PurchaseOrderItem
from app.models.promotion import Promotion

def clear():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database cleared successfully.")

if __name__ == "__main__":
    clear()
