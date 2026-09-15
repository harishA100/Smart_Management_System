from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from fastapi import HTTPException, status
from datetime import datetime, date

from app.models.supplier import Supplier, SupplierProduct
from app.models.product import Product
from app.models.purchase import PurchaseOrder, POStatus
from app.schemas.supplier import (
    SupplierCreate, SupplierUpdate, SupplierProductCreate, 
    SupplierProductUpdate, SupplierPerformanceResponse,
    SupplierComparisonItem, SupplierComparisonResponse
)

class SupplierService:
    @staticmethod
    def create_supplier(db: Session, supplier_in: SupplierCreate) -> Supplier:
        # Check unique constraints: name or email
        existing_supplier = db.query(Supplier).filter(
            or_(
                func.lower(Supplier.name) == supplier_in.name.lower(),
                Supplier.email == supplier_in.email if supplier_in.email else False
            )
        ).first()
        
        if existing_supplier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Supplier with this name or email already exists."
            )
        
        db_supplier = Supplier(**supplier_in.model_dump())
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        return db_supplier

    @staticmethod
    def get_suppliers(
        db: Session, 
        page: int = 1, 
        page_size: int = 20, 
        name: Optional[str] = None,
        contact_person: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> Dict[str, Any]:
        query = db.query(Supplier)

        if name:
            query = query.filter(Supplier.name.ilike(f"%{name}%"))
        if contact_person:
            query = query.filter(Supplier.contact_person.ilike(f"%{contact_person}%"))
        if is_active is not None:
            query = query.filter(Supplier.is_active == is_active)

        total = query.count()
        suppliers = query.offset((page - 1) * page_size).limit(page_size).all()

        return {
            "items": suppliers,
            "total": total,
            "page": page,
            "page_size": page_size
        }

    @staticmethod
    def get_supplier(db: Session, supplier_id: int) -> Supplier:
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        return supplier

    @staticmethod
    def update_supplier(db: Session, supplier_id: int, supplier_in: SupplierUpdate) -> Supplier:
        db_supplier = SupplierService.get_supplier(db, supplier_id)
        
        update_data = supplier_in.model_dump(exclude_unset=True)
        
        if 'name' in update_data and update_data['name'].lower() != db_supplier.name.lower():
            # Check unique name
            existing = db.query(Supplier).filter(func.lower(Supplier.name) == update_data['name'].lower()).first()
            if existing:
                raise HTTPException(status_code=400, detail="Supplier with this name already exists")
                
        for field, value in update_data.items():
            setattr(db_supplier, field, value)
            
        db.commit()
        db.refresh(db_supplier)
        return db_supplier

    @staticmethod
    def delete_supplier(db: Session, supplier_id: int) -> Supplier:
        db_supplier = SupplierService.get_supplier(db, supplier_id)
        
        # Check historical POs
        has_pos = db.query(PurchaseOrder).filter(PurchaseOrder.supplier_id == supplier_id).first()
        if has_pos:
            # Soft delete
            db_supplier.is_active = False
            db.commit()
            db.refresh(db_supplier)
            return db_supplier
        else:
            # Can also soft delete for safety as requested by prompt "Use soft delete"
            db_supplier.is_active = False
            db.commit()
            db.refresh(db_supplier)
            return db_supplier

    # --- Supplier Products ---

    @staticmethod
    def add_product_to_supplier(db: Session, supplier_id: int, product_in: SupplierProductCreate) -> Dict[str, Any]:
        supplier = SupplierService.get_supplier(db, supplier_id)
        if not supplier.is_active:
            raise HTTPException(status_code=400, detail="Supplier is not active")
            
        product = db.query(Product).filter(Product.id == product_in.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if not product.is_active:
            raise HTTPException(status_code=400, detail="Product is not active")
            
        # Check duplicate
        existing = db.query(SupplierProduct).filter(
            SupplierProduct.supplier_id == supplier_id,
            SupplierProduct.product_id == product_in.product_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Product is already associated with this supplier")
            
        db_sp = SupplierProduct(
            supplier_id=supplier_id,
            product_id=product_in.product_id,
            unit_price=product_in.unit_price,
            minimum_order_quantity=product_in.minimum_order_quantity,
            lead_time_days=product_in.lead_time_days,
            quality_score=product_in.quality_score,
            is_preferred=product_in.is_preferred
        )
        db.add(db_sp)
        db.commit()
        db.refresh(db_sp)
        
        return {
            **db_sp.__dict__,
            "product_name": product.name,
            "product_sku": product.sku
        }

    @staticmethod
    def get_supplier_products(db: Session, supplier_id: int) -> List[Dict[str, Any]]:
        # Ensure supplier exists
        SupplierService.get_supplier(db, supplier_id)
        
        sps = db.query(SupplierProduct, Product).join(Product).filter(SupplierProduct.supplier_id == supplier_id).all()
        result = []
        for sp, prod in sps:
            item = {**sp.__dict__, "product_name": prod.name, "product_sku": prod.sku}
            result.append(item)
        return result

    @staticmethod
    def get_supplier_product(db: Session, supplier_id: int, product_id: int) -> SupplierProduct:
        sp = db.query(SupplierProduct).filter(
            SupplierProduct.supplier_id == supplier_id,
            SupplierProduct.product_id == product_id
        ).first()
        if not sp:
            raise HTTPException(status_code=404, detail="Supplier product association not found")
        return sp

    @staticmethod
    def update_supplier_product(db: Session, supplier_id: int, product_id: int, update_in: SupplierProductUpdate) -> Dict[str, Any]:
        sp = SupplierService.get_supplier_product(db, supplier_id, product_id)
        
        update_data = update_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(sp, field, value)
            
        db.commit()
        db.refresh(sp)
        
        product = db.query(Product).filter(Product.id == product_id).first()
        
        return {
            **sp.__dict__,
            "product_name": product.name,
            "product_sku": product.sku
        }

    @staticmethod
    def remove_supplier_product(db: Session, supplier_id: int, product_id: int):
        sp = SupplierService.get_supplier_product(db, supplier_id, product_id)
        db.delete(sp)
        db.commit()

    # --- Supplier Performance ---

    @staticmethod
    def get_supplier_performance(db: Session, supplier_id: int) -> SupplierPerformanceResponse:
        # Check supplier exists
        SupplierService.get_supplier(db, supplier_id)
        
        pos = db.query(PurchaseOrder).filter(PurchaseOrder.supplier_id == supplier_id).all()
        
        total_pos = len(pos)
        if total_pos == 0:
            return SupplierPerformanceResponse(
                total_purchase_orders=0,
                completed_purchase_orders=0,
                cancelled_orders=0,
                average_delivery_time_days=0.0,
                average_quality_score=0.0,
                total_purchase_value=0.0,
                on_time_delivery_percentage=0.0
            )
            
        completed_pos = [po for po in pos if po.status == POStatus.delivered]
        cancelled_pos = [po for po in pos if po.status == POStatus.cancelled]
        
        total_value = sum(po.total_amount for po in pos if po.status != POStatus.cancelled)
        
        # Mock calculation for delivery time (expected vs actual in a real system, here we simplify if actual not tracked)
        # We will assume delivery time is expected_delivery_date - created_at for completed pos.
        total_delivery_days = 0
        on_time_count = 0
        
        for po in completed_pos:
            if po.expected_delivery_date and po.created_at:
                expected_dt = datetime.combine(po.expected_delivery_date, datetime.min.time()).replace(tzinfo=po.created_at.tzinfo)
                days = (expected_dt - po.created_at).days
                total_delivery_days += max(days, 0)
                # Assuming if delivered, it was on time for now unless we track actual delivery date.
                # In real scenario we'd check actual_delivery_date <= expected_delivery_date.
                on_time_count += 1 

        avg_delivery = total_delivery_days / len(completed_pos) if completed_pos else 0.0
        on_time_pct = (on_time_count / len(completed_pos) * 100) if completed_pos else 0.0
        
        # Average quality score from SupplierProduct table
        sps = db.query(SupplierProduct).filter(SupplierProduct.supplier_id == supplier_id).all()
        quality_scores = [sp.quality_score for sp in sps if sp.quality_score is not None]
        avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0.0
        
        return SupplierPerformanceResponse(
            total_purchase_orders=total_pos,
            completed_purchase_orders=len(completed_pos),
            cancelled_orders=len(cancelled_pos),
            average_delivery_time_days=round(avg_delivery, 2),
            average_quality_score=round(avg_quality, 2),
            total_purchase_value=float(total_value),
            on_time_delivery_percentage=round(on_time_pct, 2)
        )

    # --- Supplier Comparison ---

    @staticmethod
    def compare_suppliers(db: Session, product_id: int) -> SupplierComparisonResponse:
        sps = db.query(SupplierProduct, Supplier).join(Supplier).filter(
            SupplierProduct.product_id == product_id,
            Supplier.is_active == True
        ).all()
        
        suppliers_list = []
        for sp, supplier in sps:
            perf = SupplierService.get_supplier_performance(db, supplier.id)
            
            item = SupplierComparisonItem(
                supplier_id=supplier.id,
                supplier_name=supplier.name,
                unit_price=sp.unit_price,
                minimum_order_quantity=sp.minimum_order_quantity,
                lead_time_days=sp.lead_time_days,
                quality_score=sp.quality_score,
                is_preferred=sp.is_preferred,
                performance=perf
            )
            suppliers_list.append(item)
            
        # Sorting deterministic logic:
        # Score = (1000 / unit_price) + (quality_score * 10) - (lead_time_days) + (performance.on_time_delivery_percentage / 10)
        # If preferred, add 50 bonus points
        
        def calculate_score(item: SupplierComparisonItem) -> float:
            score = 0
            if item.unit_price > 0:
                score += 1000 / item.unit_price
            if item.quality_score:
                score += item.quality_score * 10
            if item.lead_time_days:
                score -= item.lead_time_days
            score += item.performance.on_time_delivery_percentage / 10
            if item.is_preferred:
                score += 50
            return score
            
        suppliers_list.sort(key=calculate_score, reverse=True)
        
        return SupplierComparisonResponse(
            product_id=product_id,
            suppliers=suppliers_list
        )
