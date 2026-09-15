import os
import pandas as pd
from app.database.connection import SessionLocal, engine, Base
from app.models.store import Store
from app.models.batch import ProductBatch
from app.models.product import Product
# Ensure all models are imported so Base.metadata.create_all works for new ones
import app.models

DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "supermarket")

def seed_missing():
    # Create missing tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Stores
    stores_path = os.path.join(DATA_DIR, '02_stores.csv')
    if os.path.exists(stores_path) and db.query(Store).count() == 0:
        print("Importing stores...")
        stores_df = pd.read_csv(stores_path)
        for _, row in stores_df.iterrows():
            db.add(Store(
                id=row['store_id'],
                store_name=row['store_name'],
                region=row['region'],
                store_type=row['store_type'],
                selling_area_sqft=row['selling_area_sqft']
            ))
        db.commit()
        print(f"Stores imported. Total: {db.query(Store).count()}")
        
    # Build product SKU lookup
    products = db.query(Product).all()
    sku_to_id = {p.sku: p.id for p in products}

    # 2. Product Batches
    batches_path = os.path.join(DATA_DIR, '15_product_batches.csv')
    if os.path.exists(batches_path) and db.query(ProductBatch).count() == 0:
        print("Importing product batches...")
        batches_df = pd.read_csv(batches_path)
        for _, row in batches_df.iterrows():
            # row['product_id'] is 'P0001', sku is 'SKU-P0001'
            sku = f"SKU-{row['product_id']}"
            product_id = sku_to_id.get(sku)
            if not product_id:
                print(f"Warning: Product {sku} not found!")
                continue

            db.add(ProductBatch(
                id=row['batch_id'],
                product_id=product_id,
                store_id=row['store_id'],
                batch_number=row['batch_number'],
                received_date=pd.to_datetime(row['received_date']).date(),
                manufacturing_date=pd.to_datetime(row['manufacturing_date']).date(),
                expiry_date=pd.to_datetime(row['expiry_date']).date(),
                initial_quantity=row['initial_quantity'],
                remaining_quantity=row['remaining_quantity'],
                unit_cost=row['unit_cost'],
                status=row['status']
            ))
        db.commit()
        print(f"Product Batches imported. Total: {db.query(ProductBatch).count()}")

if __name__ == "__main__":
    seed_missing()
