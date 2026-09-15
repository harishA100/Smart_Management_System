import math
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from fastapi import HTTPException
from datetime import datetime

from app.models.inventory import Inventory, InventoryTransaction, TransactionType
from app.models.product import Product
from app.schemas.inventory import (
    InventoryResponse, InventoryListResponse, InventorySummaryResponse,
    StockReceiveRequest, StockAdjustmentRequest, StockDamageRequest, 
    StockExpiryRequest, InventoryTransactionListResponse, InventoryTransactionResponse
)
from app.schemas.product import ProductResponse
from app.schemas.category import CategoryResponse

class InventoryService:
    @staticmethod
    def _calculate_status(available_stock: int, reorder_level: int) -> str:
        if available_stock <= 0:
            return "out_of_stock"
        elif available_stock <= reorder_level:
            return "low_stock"
        return "in_stock"
        
    @staticmethod
    def _build_inventory_response(inv: Inventory, product: Product) -> InventoryResponse:
        available_stock = inv.current_stock - inv.reserved_stock
        stock_status = InventoryService._calculate_status(available_stock, product.reorder_level)
        
        prod_resp = ProductResponse(
            id=product.id,
            sku=product.sku,
            barcode=product.barcode,
            name=product.name,
            description=product.description,
            category_id=product.category_id,
            brand=product.brand,
            unit=product.unit,
            cost_price=product.cost_price,
            selling_price=product.selling_price,
            reorder_level=product.reorder_level,
            maximum_stock_level=product.maximum_stock_level,
            shelf_life_days=product.shelf_life_days,
            is_active=product.is_active,
            created_at=product.created_at,
            updated_at=product.updated_at,
            category=CategoryResponse.model_validate(product.category)
        )
        
        return InventoryResponse(
            product=prod_resp,
            current_stock=inv.current_stock,
            reserved_stock=inv.reserved_stock,
            incoming_stock=inv.incoming_stock,
            damaged_stock=inv.damaged_stock,
            expired_stock=inv.expired_stock,
            available_stock=available_stock,
            reorder_level=product.reorder_level,
            maximum_stock_level=product.maximum_stock_level,
            stock_status=stock_status,
            updated_at=inv.updated_at
        )

    @staticmethod
    def get_inventory(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        category_id: Optional[int] = None,
        status: Optional[str] = None
    ) -> InventoryListResponse:
        query = db.query(Inventory, Product).join(Product, Inventory.product_id == Product.id)
        
        if category_id is not None:
            query = query.filter(Product.category_id == category_id)
            
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.sku.ilike(search_term),
                    Product.barcode.ilike(search_term)
                )
            )

        # In Python, we have to filter statuses. 
        # A bit tricky to do purely in SQL since available_stock = current - reserved.
        # Let's just fetch everything matching search/cat and filter in Python for status, 
        # but to keep pagination accurate we should do it in SQL.
        if status:
            if status == "out_of_stock":
                query = query.filter((Inventory.current_stock - Inventory.reserved_stock) <= 0)
            elif status == "low_stock":
                query = query.filter((Inventory.current_stock - Inventory.reserved_stock) > 0)
                query = query.filter((Inventory.current_stock - Inventory.reserved_stock) <= Product.reorder_level)
            elif status == "in_stock":
                query = query.filter((Inventory.current_stock - Inventory.reserved_stock) > Product.reorder_level)

        total = query.count()
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        
        offset = (page - 1) * page_size
        results = query.offset(offset).limit(page_size).all()
        
        inventory_responses = []
        for inv, prod in results:
            inventory_responses.append(InventoryService._build_inventory_response(inv, prod))

        return InventoryListResponse(
            items=inventory_responses,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    @staticmethod
    def get_inventory_by_product(db: Session, product_id: int) -> InventoryResponse:
        result = db.query(Inventory, Product).join(Product).filter(Inventory.product_id == product_id).first()
        if not result:
            raise HTTPException(status_code=404, detail="Inventory or Product not found")
        inv, prod = result
        return InventoryService._build_inventory_response(inv, prod)
        
    @staticmethod
    def get_summary(db: Session) -> InventorySummaryResponse:
        # We need total_products, total_units, low_stock, out_of_stock, inventory_value, incoming, damaged, expired
        results = db.query(Inventory, Product).join(Product, Inventory.product_id == Product.id).all()
        
        total_products = len(results)
        total_units = 0
        low_stock = 0
        out_of_stock = 0
        inventory_value = 0.0
        incoming = 0
        damaged = 0
        expired = 0
        
        for inv, prod in results:
            avail = inv.current_stock - inv.reserved_stock
            total_units += avail
            inventory_value += float(avail) * float(prod.cost_price)
            incoming += inv.incoming_stock
            damaged += inv.damaged_stock
            expired += inv.expired_stock
            
            status = InventoryService._calculate_status(avail, prod.reorder_level)
            if status == "out_of_stock":
                out_of_stock += 1
            elif status == "low_stock":
                low_stock += 1
                
        return InventorySummaryResponse(
            total_products=total_products,
            total_units=total_units,
            low_stock_products=low_stock,
            out_of_stock_products=out_of_stock,
            inventory_value=inventory_value,
            incoming_units=incoming,
            damaged_units=damaged,
            expired_units=expired
        )

    @staticmethod
    def receive_stock(db: Session, product_id: int, req: StockReceiveRequest) -> InventoryResponse:
        prod = db.query(Product).filter(Product.id == product_id).first()
        if not prod or not prod.is_active:
            raise HTTPException(status_code=404, detail="Active product not found")
            
        inv = db.query(Inventory).filter(Inventory.product_id == product_id).with_for_update().first()
        if not inv:
            raise HTTPException(status_code=404, detail="Inventory record not found")
            
        inv.current_stock += req.quantity
        
        txn = InventoryTransaction(
            product_id=product_id,
            transaction_type=TransactionType.purchase,
            quantity=req.quantity, # positive
            reference_type="purchase",
            reference_id=req.reference_id,
            notes=req.notes
        )
        db.add(txn)
        db.commit()
        db.refresh(inv)
        return InventoryService._build_inventory_response(inv, prod)

    @staticmethod
    def adjust_stock(db: Session, product_id: int, req: StockAdjustmentRequest) -> InventoryResponse:
        prod = db.query(Product).filter(Product.id == product_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found")
            
        inv = db.query(Inventory).filter(Inventory.product_id == product_id).with_for_update().first()
        if not inv:
            raise HTTPException(status_code=404, detail="Inventory record not found")
            
        new_stock = inv.current_stock + req.quantity_change
        if new_stock < 0:
            db.rollback()
            raise HTTPException(status_code=400, detail="Resulting stock cannot be negative")
            
        inv.current_stock = new_stock
        
        txn = InventoryTransaction(
            product_id=product_id,
            transaction_type=TransactionType.adjustment,
            quantity=req.quantity_change,
            notes=req.notes
        )
        db.add(txn)
        db.commit()
        db.refresh(inv)
        return InventoryService._build_inventory_response(inv, prod)

    @staticmethod
    def damage_stock(db: Session, product_id: int, req: StockDamageRequest) -> InventoryResponse:
        prod = db.query(Product).filter(Product.id == product_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found")
            
        inv = db.query(Inventory).filter(Inventory.product_id == product_id).with_for_update().first()
        if not inv:
            raise HTTPException(status_code=404, detail="Inventory record not found")
            
        available = inv.current_stock - inv.reserved_stock
        if req.quantity > available:
            db.rollback()
            raise HTTPException(status_code=400, detail="Quantity cannot exceed available stock")
            
        inv.current_stock -= req.quantity
        inv.damaged_stock += req.quantity
        
        txn = InventoryTransaction(
            product_id=product_id,
            transaction_type=TransactionType.damaged,
            quantity=-req.quantity,
            notes=req.notes
        )
        db.add(txn)
        db.commit()
        db.refresh(inv)
        return InventoryService._build_inventory_response(inv, prod)

    @staticmethod
    def expire_stock(db: Session, product_id: int, req: StockExpiryRequest) -> InventoryResponse:
        prod = db.query(Product).filter(Product.id == product_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail="Product not found")
            
        inv = db.query(Inventory).filter(Inventory.product_id == product_id).with_for_update().first()
        if not inv:
            raise HTTPException(status_code=404, detail="Inventory record not found")
            
        available = inv.current_stock - inv.reserved_stock
        if req.quantity > available:
            db.rollback()
            raise HTTPException(status_code=400, detail="Quantity cannot exceed available stock")
            
        inv.current_stock -= req.quantity
        inv.expired_stock += req.quantity
        
        txn = InventoryTransaction(
            product_id=product_id,
            transaction_type=TransactionType.expired,
            quantity=-req.quantity,
            notes=req.notes
        )
        db.add(txn)
        db.commit()
        db.refresh(inv)
        return InventoryService._build_inventory_response(inv, prod)

    @staticmethod
    def get_transactions(
        db: Session,
        product_id: int,
        page: int = 1,
        page_size: int = 20,
        transaction_type: Optional[str] = None
    ) -> InventoryTransactionListResponse:
        query = db.query(InventoryTransaction).filter(InventoryTransaction.product_id == product_id)
        
        if transaction_type:
            # Convert string to enum if needed, or filter by enum value
            query = query.filter(InventoryTransaction.transaction_type == transaction_type)
            
        total = query.count()
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        
        offset = (page - 1) * page_size
        transactions = query.order_by(desc(InventoryTransaction.created_at)).offset(offset).limit(page_size).all()
        
        return InventoryTransactionListResponse(
            items=transactions,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
