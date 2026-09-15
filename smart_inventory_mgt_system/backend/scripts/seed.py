import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.database.connection import engine, Base
from app.models.category import Category
from app.models.product import Product
from app.models.supplier import Supplier

def seed_data(db: Session):
    print("Seeding Categories...")
    categories = [
        Category(name="Dairy", description="Milk, cheese, and yogurt products"),
        Category(name="Bakery", description="Bread, pastries, and baked goods"),
        Category(name="Beverages", description="Soft drinks, juices, and water"),
        Category(name="Snacks", description="Chips, biscuits, and quick bites"),
        Category(name="Grocery", description="Staples like rice, flour, and spices"),
        Category(name="Personal Care", description="Soap, shampoo, and hygiene")
    ]
    db.add_all(categories)
    db.commit()

    # Fetch inserted categories to use their IDs
    cat_map = {c.name: c for c in db.query(Category).all()}

    print("Seeding Products...")
    products = [
        Product(sku="DAIRY-001", name="Milk 1L", category_id=cat_map["Dairy"].id, cost_price=1.20, selling_price=1.50, unit="liter", brand="Fresh Farms"),
        Product(sku="BAKE-001", name="Bread", category_id=cat_map["Bakery"].id, cost_price=1.00, selling_price=1.50, unit="loaf", brand="Daily Bake"),
        Product(sku="GROC-001", name="Maggi Noodles", category_id=cat_map["Grocery"].id, cost_price=0.25, selling_price=0.50, unit="pack", brand="Nestle"),
        Product(sku="BEV-001", name="Coca-Cola 750ml", category_id=cat_map["Beverages"].id, cost_price=0.80, selling_price=1.25, unit="bottle", brand="Coca-Cola"),
        Product(sku="GROC-002", name="Rice 5kg", category_id=cat_map["Grocery"].id, cost_price=5.00, selling_price=8.00, unit="bag", brand="Agro"),
        Product(sku="DAIRY-002", name="Yogurt", category_id=cat_map["Dairy"].id, cost_price=0.50, selling_price=0.90, unit="cup", brand="Fresh Farms"),
        Product(sku="SNACK-001", name="Biscuits", category_id=cat_map["Snacks"].id, cost_price=0.40, selling_price=0.80, unit="pack", brand="Britannia"),
        Product(sku="GROC-003", name="Cooking Oil", category_id=cat_map["Grocery"].id, cost_price=3.00, selling_price=4.50, unit="liter", brand="Saffola"),
        Product(sku="GROC-004", name="Sugar", category_id=cat_map["Grocery"].id, cost_price=0.80, selling_price=1.10, unit="kg", brand="SweetLife"),
        Product(sku="BEV-002", name="Tea", category_id=cat_map["Beverages"].id, cost_price=2.00, selling_price=3.50, unit="box", brand="Lipton"),
        Product(sku="BEV-003", name="Coffee", category_id=cat_map["Beverages"].id, cost_price=4.00, selling_price=6.00, unit="jar", brand="Nescafe")
    ]
    db.add_all(products)
    db.commit()

    print("Seeding Suppliers...")
    suppliers = [
        Supplier(name="ABC Foods", contact_person="John Doe", email="john@abcfoods.com", reliability_score=9.5),
        Supplier(name="Fresh Dairy Co.", contact_person="Jane Smith", email="jane@freshdairy.com", reliability_score=9.0),
        Supplier(name="Global Beverages", contact_person="Bob Johnson", email="bob@globalbev.com", reliability_score=8.5),
        Supplier(name="Organic Farms", contact_person="Alice Brown", email="alice@organicfarms.com", reliability_score=9.8),
        Supplier(name="Snacks World", contact_person="Charlie Davis", email="charlie@snacksworld.com", reliability_score=8.0)
    ]
    db.add_all(suppliers)
    db.commit()

    print("Seed data successfully inserted.")

if __name__ == "__main__":
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    with Session(engine) as session:
        # Prevent seeding if data already exists
        if session.query(Category).first():
            print("Database already has data. Skipping seed.")
        else:
            seed_data(session)
