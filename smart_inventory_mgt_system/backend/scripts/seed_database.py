import os
import csv
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.category import Category
from app.models.product import Product
from app.models.supplier import Supplier, SupplierProduct
from app.models.sales import Customer, Sale, SaleItem, PaymentMethod, SalesChannel
from app.models.purchase import PurchaseOrder, PurchaseOrderItem, POStatus
from app.models.inventory import Inventory, InventoryTransaction, TransactionType
from app.models.promotion import Promotion, PromotionType

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "supermarket")

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None

def parse_float(val):
    try:
        return float(val)
    except:
        return 0.0

def parse_int(val):
    try:
        return int(float(val))
    except:
        return 0

def load_csv(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        logger.warning(f"File {filename} not found.")
        return []
    with open(path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

def seed():
    db = SessionLocal()
    
    try:
        # 1. Categories & Products
        prod_data = load_csv("01_products.csv")
        logger.info(f"Importing {len(prod_data)} products...")
        cat_map = {}
        for row in prod_data:
            cat_name = row.get("category", "Uncategorized")
            if cat_name not in cat_map:
                cat = db.query(Category).filter_by(name=cat_name).first()
                if not cat:
                    cat = Category(name=cat_name, is_active=True)
                    db.add(cat)
                    db.flush()
                cat_map[cat_name] = cat.id

        product_map = {} 
        for row in prod_data:
            sku = f"SKU-{row['product_id']}"
            prod = db.query(Product).filter_by(sku=sku).first()
            if not prod:
                prod = Product(
                    sku=sku,
                    barcode=f"BC-{row['product_id']}",
                    name=row['product_name'],
                    description=row.get('subcategory', ''),
                    category_id=cat_map[row.get("category", "Uncategorized")],
                    brand=row['brand'],
                    unit=row['unit_of_measure'],
                    cost_price=parse_float(row['unit_cost']),
                    selling_price=parse_float(row['unit_price']),
                    reorder_level=parse_int(row['reorder_point']),
                    maximum_stock_level=parse_int(row['max_stock']),
                    shelf_life_days=parse_int(row['shelf_life_days']),
                    is_active=True
                )
                db.add(prod)
                db.flush()
            product_map[row['product_id']] = prod.id
        db.commit()
        logger.info(f"Products imported. DB Total: {db.query(Product).count()}")

        # 3. Suppliers
        supplier_data = load_csv("03_suppliers.csv")
        supplier_map = {}
        for row in supplier_data:
            supp = db.query(Supplier).filter_by(name=row['supplier_name']).first()
            if not supp:
                supp = Supplier(
                    name=row['supplier_name'],
                    contact_person="Unknown",
                    email=f"contact@{row['supplier_id']}.com",
                    phone="000-000-0000",
                    address="Unknown",
                    city="Unknown",
                    state="Unknown",
                    pincode="000000",
                    reliability_score=parse_float(row.get('on_time_rate', 0.9)) * 100,
                    is_active=True
                )
                db.add(supp)
                db.flush()
            supplier_map[row['supplier_id']] = supp.id
        db.commit()
        logger.info(f"Suppliers imported. DB Total: {db.query(Supplier).count()}")

        # 4. Supplier Products
        sp_data = load_csv("04_supplier_products.csv")
        for row in sp_data:
            db_prod_id = product_map.get(row['product_id'])
            db_supp_id = supplier_map.get(row['supplier_id'])
            if db_prod_id and db_supp_id:
                sp = db.query(SupplierProduct).filter_by(supplier_id=db_supp_id, product_id=db_prod_id).first()
                if not sp:
                    sp = SupplierProduct(
                        supplier_id=db_supp_id,
                        product_id=db_prod_id,
                        supplier_sku=f"SUP-{row['product_id']}",
                        unit_price=parse_float(row['unit_cost']),
                        minimum_order_quantity=parse_int(row['moq']),
                        lead_time_days=parse_int(row['lead_time_days']),
                        is_preferred=True
                    )
                    db.add(sp)
        db.commit()
        logger.info(f"Supplier Products imported. DB Total: {db.query(SupplierProduct).count()}")

        # 5. Customers
        cust_data = load_csv("13_customers.csv")
        cust_map = {}
        for row in cust_data:
            cust = db.query(Customer).filter_by(email=row['email']).first()
            if not cust:
                cust = Customer(
                    name=row['name'],
                    email=row['email'],
                    phone=row['phone']
                )
                db.add(cust)
                db.flush()
            cust_map[row['customer_id']] = cust.id
        db.commit()
        logger.info(f"Customers imported. DB Total: {db.query(Customer).count()}")

        # 6. Promotions
        promo_data = load_csv("06_promotions.csv")
        for row in promo_data:
            db_prod_id = product_map.get(row['product_id'])
            if db_prod_id:
                promo = db.query(Promotion).filter_by(name=f"Promo {row['promotion_id']}").first()
                if not promo:
                    promo = Promotion(
                        product_id=db_prod_id,
                        name=f"Promo {row['promotion_id']}",
                        promotion_type=PromotionType.discount,
                        discount_percentage=parse_float(row['discount_rate']) * 100,
                        start_date=parse_date(row['start_date']),
                        end_date=parse_date(row['end_date']),
                        is_active=True
                    )
                    db.add(promo)
        db.commit()
        logger.info(f"Promotions imported. DB Total: {db.query(Promotion).count()}")

        # 7. Sales & Sale Items
        sales_data = load_csv("07_sales.csv")
        invoices = {} 
        for row in sales_data:
            key = (row['date'], row['store_id'])
            if key not in invoices:
                invoices[key] = []
            invoices[key].append(row)
        
        customer_ids = list(cust_map.values())
        if not customer_ids:
            customer_ids = [None]
            
        cust_idx = 0
        for (date_str, store_id), items in invoices.items():
            inv_date = parse_date(date_str)
            if not inv_date: continue
            invoice_num = f"INV-{date_str.replace('-','')}-{store_id}"
            
            sale = db.query(Sale).filter_by(invoice_number=invoice_num).first()
            if not sale:
                sale = Sale(
                    customer_id=customer_ids[cust_idx % len(customer_ids)],
                    invoice_number=invoice_num,
                    subtotal=0, discount=0, tax=0, total_amount=0,
                    payment_method=PaymentMethod.cash,
                    sales_channel=SalesChannel.store,
                    created_at=datetime.strptime(f"{date_str} 12:00:00", "%Y-%m-%d %H:%M:%S")
                )
                db.add(sale)
                db.flush()
                cust_idx += 1
                
                subtotal = 0
                for item in items:
                    db_prod_id = product_map.get(item['product_id'])
                    if not db_prod_id: continue
                    qty = parse_int(item['units_sold'])
                    u_price = parse_float(item['unit_price'])
                    revenue = parse_float(item['sales_revenue'])
                    discount = (qty * u_price) - revenue
                    if discount < 0: discount = 0
                    
                    si = SaleItem(
                        sale_id=sale.id,
                        product_id=db_prod_id,
                        quantity=qty,
                        unit_price=u_price,
                        discount=discount,
                        total_price=revenue
                    )
                    db.add(si)
                    subtotal += revenue
                
                sale.subtotal = subtotal
                sale.total_amount = subtotal
        db.commit()
        logger.info(f"Sales & Items imported. DB Total Sales: {db.query(Sale).count()}")

        # 8. Purchase Orders & Items
        po_data = load_csv("09_purchase_orders.csv")
        po_items_data = load_csv("10_purchase_order_items.csv")
        
        poi_map = {}
        for item in po_items_data:
            if item['po_id'] not in poi_map:
                poi_map[item['po_id']] = []
            poi_map[item['po_id']].append(item)

        for row in po_data:
            po_num = f"PO-{row['po_id']}"
            po = db.query(PurchaseOrder).filter_by(po_number=po_num).first()
            if not po:
                db_supp_id = supplier_map.get(row['supplier_id'])
                if not db_supp_id: continue
                
                status_map = {'Delivered': POStatus.delivered, 'Pending': POStatus.ordered, 'Cancelled': POStatus.cancelled}
                
                po = PurchaseOrder(
                    po_number=po_num,
                    supplier_id=db_supp_id,
                    status=status_map.get(row['status'], POStatus.ordered),
                    subtotal=parse_float(row['total_cost']),
                    tax=0,
                    total_amount=parse_float(row['total_cost']),
                    expected_delivery_date=parse_date(row['order_date']),
                    created_at=datetime.strptime(f"{row['order_date']} 10:00:00", "%Y-%m-%d %H:%M:%S")
                )
                db.add(po)
                db.flush()
                
                items = poi_map.get(row['po_id'], [])
                for item in items:
                    db_prod_id = product_map.get(item['product_id'])
                    if not db_prod_id: continue
                    qty = parse_int(item['quantity'])
                    u_cost = parse_float(item['unit_cost'])
                    poi = PurchaseOrderItem(
                        purchase_order_id=po.id,
                        product_id=db_prod_id,
                        quantity=qty,
                        unit_price=u_cost,
                        total_price=parse_float(item['line_total']),
                        received_quantity=qty if po.status == POStatus.delivered else 0
                    )
                    db.add(poi)
        db.commit()
        logger.info(f"Purchase Orders imported. DB Total: {db.query(PurchaseOrder).count()}")

        # 9. Inventory Daily -> take latest state
        inv_data = load_csv("08_inventory_daily.csv")
        latest_inv = {}
        for row in inv_data:
            pid = row['product_id']
            d = row['date']
            if pid not in latest_inv or d > latest_inv[pid]['date']:
                latest_inv[pid] = row
                
        for pid, row in latest_inv.items():
            db_prod_id = product_map.get(pid)
            if db_prod_id:
                inv = db.query(Inventory).filter_by(product_id=db_prod_id).first()
                if not inv:
                    inv = Inventory(
                        product_id=db_prod_id,
                        current_stock=parse_int(row['closing_stock']),
                        updated_at=datetime.strptime(f"{row['date']} 23:59:59", "%Y-%m-%d %H:%M:%S")
                    )
                    db.add(inv)
                else:
                    inv.current_stock = parse_int(row['closing_stock'])
                    inv.updated_at = datetime.strptime(f"{row['date']} 23:59:59", "%Y-%m-%d %H:%M:%S")
        db.commit()
        logger.info(f"Inventory imported. DB Total: {db.query(Inventory).count()}")

        # 10. Inventory Transactions
        inv_tx_data = load_csv("14_inventory_transactions.csv")
        for row in inv_tx_data:
            db_prod_id = product_map.get(row['product_id'])
            if db_prod_id:
                tx = db.query(InventoryTransaction).filter_by(
                    product_id=db_prod_id, 
                    reference_id=parse_int(row['reference_id']),
                    reference_type=row['reference_type']
                ).first()
                if not tx:
                    tx_type = row['transaction_type']
                    valid_types = [e.value for e in TransactionType]
                    if tx_type not in valid_types:
                        tx_type = TransactionType.manual
                    else:
                        tx_type = TransactionType(tx_type)

                    tx = InventoryTransaction(
                        product_id=db_prod_id,
                        transaction_type=tx_type,
                        quantity=parse_int(row['quantity']),
                        reference_type=row['reference_type'],
                        reference_id=parse_int(row['reference_id']),
                        notes=row.get('notes'),
                        created_at=datetime.strptime(f"{row['transaction_date']} 00:00:00", "%Y-%m-%d %H:%M:%S")
                    )
                    db.add(tx)
        db.commit()
        logger.info(f"Inventory Transactions imported. DB Total: {db.query(InventoryTransaction).count()}")

    except Exception as e:
        db.rollback()
        logger.error(f"Error occurred: {e}")
        raise e
    finally:
        db.close()
        logger.info("Database seeding complete!")

if __name__ == "__main__":
    seed()
