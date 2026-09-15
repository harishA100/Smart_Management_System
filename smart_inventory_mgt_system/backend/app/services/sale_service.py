import math
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.sales import Sale, SaleItem, PaymentMethod, SalesChannel
from app.models.product import Product
from app.models.inventory import Inventory, InventoryTransaction, TransactionType
from app.schemas.sale import SaleCreate, SaleResponse, SaleListResponse, SalesSummaryResponse

def utc_now():
    return datetime.now(timezone.utc)

class SaleService:
    @staticmethod
    def _generate_invoice_number(db: Session) -> str:
        # Simple format: INV-YYYY-XXXXXX
        current_year = datetime.now().year
        # Count sales today or just absolute count
        # For simplicity and uniqueness, we will use total absolute count + 1
        # In a very high concurrency environment, a sequence is better, but counting works for this scale
        total_sales = db.query(Sale).count()
        return f"INV-{current_year}-{(total_sales + 1):06d}"

    @staticmethod
    def create_sale(db: Session, sale_in: SaleCreate) -> SaleResponse:
        # Pre-validate product existence and uniqueness in the sale request
        product_ids = [item.product_id for item in sale_in.items]
        if len(product_ids) != len(set(product_ids)):
            raise HTTPException(status_code=400, detail="Duplicate products in sale items not allowed")

        # Fetch products
        products = db.query(Product).filter(Product.id.in_(product_ids)).all()
        prod_map = {p.id: p for p in products}

        for item in sale_in.items:
            if item.product_id not in prod_map:
                raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
            if not prod_map[item.product_id].is_active:
                raise HTTPException(status_code=400, detail=f"Product ID {item.product_id} is inactive")

        # Start calculating and locking inventory
        # We sort product_ids to prevent deadlocks during row locking
        product_ids.sort()
        
        # Lock the inventory rows for these products
        inventories = db.query(Inventory).filter(Inventory.product_id.in_(product_ids)).with_for_update().all()
        inv_map = {inv.product_id: inv for inv in inventories}

        subtotal = 0.0
        sale_items = []
        inventory_transactions = []
        
        for item in sale_in.items:
            prod = prod_map[item.product_id]
            inv = inv_map.get(item.product_id)
            
            if not inv:
                db.rollback()
                raise HTTPException(status_code=404, detail=f"Inventory record missing for product {item.product_id}")
                
            available = inv.current_stock - inv.reserved_stock
            if item.quantity > available:
                msg = f"Insufficient stock for product '{prod.name}' (Requested: {item.quantity}, Available: {available})"
                db.rollback()
                raise HTTPException(status_code=400, detail=msg)

            # Calculate price
            unit_price = float(prod.selling_price)
            item_discount = float(item.discount)
            total_price = (unit_price * item.quantity) - item_discount
            if total_price < 0:
                total_price = 0.0
                
            subtotal += total_price
            
            # Prepare SaleItem
            sale_items.append(SaleItem(
                product_id=prod.id,
                quantity=item.quantity,
                unit_price=unit_price,
                discount=item_discount,
                total_price=total_price
            ))
            
            # Update Inventory
            inv.current_stock -= item.quantity
            
            # Prepare InventoryTransaction
            inventory_transactions.append(InventoryTransaction(
                product_id=prod.id,
                transaction_type=TransactionType.sale,
                quantity=-item.quantity,
                reference_type="sale",
                # reference_id will be set after Sale is flushed
                notes="Sale"
            ))

        # Calculate final totals
        final_discount = sale_in.discount
        final_tax = sale_in.tax
        total_amount = subtotal - final_discount + final_tax
        if total_amount < 0:
            total_amount = 0.0

        # Create Sale
        sale = Sale(
            customer_id=sale_in.customer_id,
            invoice_number=SaleService._generate_invoice_number(db),
            subtotal=subtotal,
            discount=final_discount,
            tax=final_tax,
            total_amount=total_amount,
            payment_method=sale_in.payment_method,
            sales_channel=sale_in.sales_channel
        )
        db.add(sale)
        
        try:
            db.flush() # Flush to get sale.id
            
            for si in sale_items:
                si.sale_id = sale.id
                db.add(si)
                
            for it in inventory_transactions:
                it.reference_id = sale.id
                db.add(it)
                
            db.commit()
            db.refresh(sale)
            return SaleResponse.model_validate(sale)
        except Exception as e:
            db.rollback()
            # If unique constraint on invoice_number fails, etc.
            raise HTTPException(status_code=500, detail="Failed to complete sale transaction")

    @staticmethod
    def get_sales(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        payment_method: Optional[str] = None,
        sales_channel: Optional[str] = None,
        customer_id: Optional[int] = None
    ) -> SaleListResponse:
        query = db.query(Sale)
        
        if payment_method:
            query = query.filter(Sale.payment_method == payment_method)
        if sales_channel:
            query = query.filter(Sale.sales_channel == sales_channel)
        if customer_id:
            query = query.filter(Sale.customer_id == customer_id)
            
        total = query.count()
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        offset = (page - 1) * page_size
        
        sales = query.order_by(Sale.created_at.desc()).offset(offset).limit(page_size).all()
        
        return SaleListResponse(
            items=[SaleResponse.model_validate(s) for s in sales],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    @staticmethod
    def get_sale(db: Session, sale_id: int) -> SaleResponse:
        sale = db.query(Sale).filter(Sale.id == sale_id).first()
        if not sale:
            raise HTTPException(status_code=404, detail="Sale not found")
        return SaleResponse.model_validate(sale)

    @staticmethod
    def get_summary(db: Session) -> SalesSummaryResponse:
        now = utc_now()
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        start_of_7_days = now - timedelta(days=7)
        start_of_30_days = now - timedelta(days=30)
        
        # We can do these in multiple queries or one complex query. Multiple is simpler for this scale.
        
        today_sales = db.query(func.sum(Sale.total_amount)).filter(Sale.created_at >= start_of_today).scalar() or 0.0
        last_7_days = db.query(func.sum(Sale.total_amount)).filter(Sale.created_at >= start_of_7_days).scalar() or 0.0
        last_30_days = db.query(func.sum(Sale.total_amount)).filter(Sale.created_at >= start_of_30_days).scalar() or 0.0
        
        total_orders = db.query(Sale).count()
        items_sold = db.query(func.sum(SaleItem.quantity)).scalar() or 0
        
        # Average order value across all time
        total_revenue = db.query(func.sum(Sale.total_amount)).scalar() or 0.0
        avg_order_value = (total_revenue / total_orders) if total_orders > 0 else 0.0

        return SalesSummaryResponse(
            today_sales=today_sales,
            total_orders=total_orders,
            items_sold=items_sold,
            average_order_value=avg_order_value,
            last_7_days_sales=last_7_days,
            last_30_days_sales=last_30_days,
            total_revenue=total_revenue
        )
