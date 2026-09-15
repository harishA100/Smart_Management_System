import math
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_, and_
from fastapi import HTTPException
from app.models.product import Product
from app.models.category import Category
from app.models.inventory import Inventory
from app.schemas.product import ProductCreate, ProductUpdate, ProductListResponse
from typing import Optional, Dict, Any

class ProductService:
    @staticmethod
    def get_products(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        category_id: Optional[int] = None,
        is_active: Optional[bool] = None
    ) -> ProductListResponse:
        query = db.query(Product)

        # Filters
        if category_id is not None:
            query = query.filter(Product.category_id == category_id)
        if is_active is not None:
            query = query.filter(Product.is_active == is_active)
            
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.sku.ilike(search_term),
                    Product.barcode.ilike(search_term),
                    Product.brand.ilike(search_term)
                )
            )

        total = query.count()
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        
        offset = (page - 1) * page_size
        products = query.offset(offset).limit(page_size).all()

        return ProductListResponse(
            items=products,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    @staticmethod
    def get_product(db: Session, product_id: int) -> Product:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

    @staticmethod
    def create_product(db: Session, product_in: ProductCreate) -> Product:
        # Validate category exists
        category = db.query(Category).filter(Category.id == product_in.category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        db_product = Product(**product_in.model_dump())
        db.add(db_product)
        try:
            db.commit()
            db.refresh(db_product)
            
            # Initialize empty inventory record for the new product
            db_inventory = Inventory(
                product_id=db_product.id,
                current_stock=0,
                reserved_stock=0,
                incoming_stock=0,
                damaged_stock=0,
                expired_stock=0
            )
            db.add(db_inventory)
            db.commit()
            
        except IntegrityError as e:
            db.rollback()
            error_str = str(e.orig).lower()
            if "sku" in error_str:
                raise HTTPException(status_code=409, detail="Product with this SKU already exists")
            elif "barcode" in error_str:
                raise HTTPException(status_code=409, detail="Product with this Barcode already exists")
            raise HTTPException(status_code=409, detail="Database integrity error")
        return db_product

    @staticmethod
    def update_product(db: Session, product_id: int, product_in: ProductUpdate) -> Product:
        db_product = ProductService.get_product(db, product_id)
        
        update_data = product_in.model_dump(exclude_unset=True)
        
        if "category_id" in update_data:
            category = db.query(Category).filter(Category.id == update_data["category_id"]).first()
            if not category:
                raise HTTPException(status_code=404, detail="Category not found")

        for field, value in update_data.items():
            setattr(db_product, field, value)

        try:
            db.commit()
            db.refresh(db_product)
        except IntegrityError as e:
            db.rollback()
            error_str = str(e.orig).lower()
            if "sku" in error_str:
                raise HTTPException(status_code=409, detail="Product with this SKU already exists")
            elif "barcode" in error_str:
                raise HTTPException(status_code=409, detail="Product with this Barcode already exists")
            raise HTTPException(status_code=409, detail="Database integrity error")
            
        return db_product

    @staticmethod
    def soft_delete_product(db: Session, product_id: int) -> Dict[str, Any]:
        db_product = ProductService.get_product(db, product_id)
        db_product.is_active = False
        db.commit()
        return {"status": "success", "message": f"Product {product_id} soft deleted successfully"}
