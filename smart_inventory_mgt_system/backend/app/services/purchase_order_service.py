from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from fastapi import HTTPException, status
from datetime import datetime, date

from app.models.purchase import PurchaseOrder, PurchaseOrderItem, POStatus
from app.models.supplier import Supplier, SupplierProduct
from app.models.product import Product
from app.models.inventory import Inventory, InventoryTransaction, TransactionType
from app.schemas.purchase_order import (
    PurchaseOrderCreate, PurchaseOrderReceive, 
    RejectionReason, CancellationReason
)

class PurchaseOrderService:
    @staticmethod
    def _generate_po_number(db: Session) -> str:
        year = datetime.now().year
        prefix = f"PO-{year}-"
        
        last_po = db.query(PurchaseOrder).filter(PurchaseOrder.po_number.like(f"{prefix}%")).order_by(PurchaseOrder.id.desc()).first()
        
        if last_po:
            try:
                last_num = int(last_po.po_number.split("-")[-1])
                new_num = last_num + 1
            except ValueError:
                new_num = 1
        else:
            new_num = 1
            
        return f"{prefix}{new_num:06d}"

    @staticmethod
    def create_po(db: Session, po_in: PurchaseOrderCreate, user_id: Optional[int] = None) -> PurchaseOrder:
        supplier = db.query(Supplier).filter(Supplier.id == po_in.supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        if not supplier.is_active:
            raise HTTPException(status_code=400, detail="Supplier is not active")

        subtotal = 0.0
        po_items = []
        
        for item_in in po_in.items:
            product = db.query(Product).filter(Product.id == item_in.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product ID {item_in.product_id} not found")
            if not product.is_active:
                raise HTTPException(status_code=400, detail=f"Product {product.name} is not active")
                
            sp = db.query(SupplierProduct).filter(
                SupplierProduct.supplier_id == po_in.supplier_id,
                SupplierProduct.product_id == item_in.product_id
            ).first()
            if not sp:
                raise HTTPException(status_code=400, detail=f"Product {product.name} is not supplied by this supplier")
                
            if item_in.quantity < sp.minimum_order_quantity:
                raise HTTPException(status_code=400, detail=f"Quantity for {product.name} is below MOQ of {sp.minimum_order_quantity}")

            unit_price = float(sp.unit_price)
            item_total = unit_price * item_in.quantity
            subtotal += item_total
            
            po_item = PurchaseOrderItem(
                product_id=product.id,
                quantity=item_in.quantity,
                unit_price=unit_price,
                total_price=item_total,
                received_quantity=0
            )
            po_items.append(po_item)

        tax = 0.0 # Default as requested in plan
        total_amount = subtotal + tax

        po = PurchaseOrder(
            po_number=PurchaseOrderService._generate_po_number(db),
            supplier_id=po_in.supplier_id,
            status=POStatus.draft,
            subtotal=subtotal,
            tax=tax,
            total_amount=total_amount,
            expected_delivery_date=po_in.expected_delivery_date,
            notes=po_in.notes,
            created_by=user_id
        )
        
        db.add(po)
        db.flush()
        
        for po_item in po_items:
            po_item.purchase_order_id = po.id
            db.add(po_item)
            
        db.commit()
        db.refresh(po)
        return PurchaseOrderService.get_po(db, po.id)

    @staticmethod
    def get_pos(
        db: Session, 
        page: int = 1, 
        page_size: int = 20, 
        status: Optional[str] = None,
        supplier_id: Optional[int] = None,
        po_number: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        query = db.query(PurchaseOrder)

        if status:
            try:
                status_enum = POStatus(status)
                query = query.filter(PurchaseOrder.status == status_enum)
            except ValueError:
                pass
        if supplier_id:
            query = query.filter(PurchaseOrder.supplier_id == supplier_id)
        if po_number:
            query = query.filter(PurchaseOrder.po_number.ilike(f"%{po_number}%"))
        if start_date:
            query = query.filter(func.date(PurchaseOrder.created_at) >= start_date)
        if end_date:
            query = query.filter(func.date(PurchaseOrder.created_at) <= end_date)

        total = query.count()
        pos = (
            query
            .options(
                joinedload(PurchaseOrder.supplier),
                joinedload(PurchaseOrder.purchase_order_items).joinedload(PurchaseOrderItem.product)
            )
            .order_by(PurchaseOrder.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        
        items_resp = []
        for po in pos:
            items = [
                {
                    "id": item.id,
                    "product_id": item.product_id,
                    "product_name": item.product.name,
                    "product_sku": item.product.sku,
                    "quantity": item.quantity,
                    "received_quantity": item.received_quantity,
                    "unit_price": float(item.unit_price),
                    "total_price": float(item.total_price),
                }
                for item in po.purchase_order_items
            ]
            items_resp.append({
                "id": po.id,
                "po_number": po.po_number,
                "supplier_id": po.supplier_id,
                "supplier_name": po.supplier.name,
                "status": po.status,
                "subtotal": float(po.subtotal),
                "tax": float(po.tax),
                "total_amount": float(po.total_amount),
                "expected_delivery_date": po.expected_delivery_date,
                "notes": po.notes,
                "created_at": po.created_at,
                "updated_at": po.updated_at,
                "items": items,
            })

        return {
            "items": items_resp,
            "total": total,
            "page": page,
            "page_size": page_size
        }

    @staticmethod
    def get_po(db: Session, po_id: int) -> Dict[str, Any]:
        po = (
            db.query(PurchaseOrder)
            .options(
                joinedload(PurchaseOrder.supplier),
                joinedload(PurchaseOrder.purchase_order_items).joinedload(PurchaseOrderItem.product)
            )
            .filter(PurchaseOrder.id == po_id)
            .first()
        )
        if not po:
            raise HTTPException(status_code=404, detail="Purchase Order not found")
            
        items = [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name,
                "product_sku": item.product.sku,
                "quantity": item.quantity,
                "received_quantity": item.received_quantity,
                "unit_price": float(item.unit_price),
                "total_price": float(item.total_price),
            }
            for item in po.purchase_order_items
        ]
        return {
            "id": po.id,
            "po_number": po.po_number,
            "supplier_id": po.supplier_id,
            "supplier_name": po.supplier.name,
            "status": po.status,
            "subtotal": float(po.subtotal),
            "tax": float(po.tax),
            "total_amount": float(po.total_amount),
            "expected_delivery_date": po.expected_delivery_date,
            "notes": po.notes,
            "created_at": po.created_at,
            "updated_at": po.updated_at,
            "items": items,
        }

    # --- Workflow ---

    @staticmethod
    def submit_po(db: Session, po_id: int) -> Dict[str, Any]:
        po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).with_for_update().first()
        if not po:
            raise HTTPException(status_code=404, detail="Purchase Order not found")
        if po.status != POStatus.draft:
            raise HTTPException(status_code=400, detail="Only draft POs can be submitted")
            
        po.status = POStatus.pending_approval
        db.commit()
        return PurchaseOrderService.get_po(db, po.id)

    @staticmethod
    def approve_po(db: Session, po_id: int, user_id: Optional[int] = None) -> Dict[str, Any]:
        po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).with_for_update().first()
        if not po:
            raise HTTPException(status_code=404, detail="Purchase Order not found")
        if po.status != POStatus.pending_approval:
            raise HTTPException(status_code=400, detail="Only pending POs can be approved")
            
        po.status = POStatus.approved
        po.approved_by = user_id
        po.approved_at = func.now()
        db.commit()
        return PurchaseOrderService.get_po(db, po.id)

    @staticmethod
    def reject_po(db: Session, po_id: int, reason: RejectionReason) -> Dict[str, Any]:
        po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).with_for_update().first()
        if not po:
            raise HTTPException(status_code=404, detail="Purchase Order not found")
        if po.status != POStatus.pending_approval:
            raise HTTPException(status_code=400, detail="Only pending POs can be rejected")
            
        po.status = POStatus.rejected
        po.notes = (po.notes or "") + f"\nRejected: {reason.rejection_reason}"
        db.commit()
        return PurchaseOrderService.get_po(db, po.id)

    @staticmethod
    def order_po(db: Session, po_id: int) -> Dict[str, Any]:
        po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).with_for_update().first()
        if not po:
            raise HTTPException(status_code=404, detail="Purchase Order not found")
        if po.status != POStatus.approved:
            raise HTTPException(status_code=400, detail="Only approved POs can be ordered")
            
        po.status = POStatus.ordered
        
        # Increase incoming_stock for inventory
        for item in po.purchase_order_items:
            inv = db.query(Inventory).filter(Inventory.product_id == item.product_id).first()
            if inv:
                inv.incoming_stock += item.quantity
            else:
                new_inv = Inventory(product_id=item.product_id, current_stock=0, incoming_stock=item.quantity)
                db.add(new_inv)
                
        db.commit()
        return PurchaseOrderService.get_po(db, po.id)

    @staticmethod
    def cancel_po(db: Session, po_id: int, reason: CancellationReason) -> Dict[str, Any]:
        po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).with_for_update().first()
        if not po:
            raise HTTPException(status_code=404, detail="Purchase Order not found")
            
        if po.status not in [POStatus.draft, POStatus.pending_approval, POStatus.approved, POStatus.ordered]:
            raise HTTPException(status_code=400, detail=f"Cannot cancel PO in status {po.status}")
            
        if po.status == POStatus.ordered:
            # Revert incoming_stock
            for item in po.purchase_order_items:
                inv = db.query(Inventory).filter(Inventory.product_id == item.product_id).first()
                if inv:
                    inv.incoming_stock = max(0, inv.incoming_stock - item.quantity)
                    
        po.status = POStatus.cancelled
        po.notes = (po.notes or "") + f"\nCancelled: {reason.cancellation_reason}"
        db.commit()
        return PurchaseOrderService.get_po(db, po.id)

    # --- Receiving ---

    @staticmethod
    def receive_po(db: Session, po_id: int, receive_in: PurchaseOrderReceive, user_id: Optional[int] = None) -> Dict[str, Any]:
        po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).with_for_update().first()
        if not po:
            raise HTTPException(status_code=404, detail="Purchase Order not found")
            
        if po.status not in [POStatus.ordered, POStatus.partially_delivered]:
            raise HTTPException(status_code=400, detail="PO must be in ordered or partially_delivered status to receive stock")

        receive_map = {item.product_id: item.received_quantity for item in receive_in.items}
        
        po_item_map = {item.product_id: item for item in po.purchase_order_items}
        
        # Lock inventory rows to prevent race conditions during update
        product_ids_to_lock = list(receive_map.keys())
        product_ids_to_lock.sort() # Deadlock prevention
        inventories = db.query(Inventory).filter(Inventory.product_id.in_(product_ids_to_lock)).with_for_update().all()
        inv_map = {inv.product_id: inv for inv in inventories}
        
        for product_id, rec_qty in receive_map.items():
            if product_id not in po_item_map:
                raise HTTPException(status_code=400, detail=f"Product {product_id} is not part of this PO")
            
            po_item = po_item_map[product_id]
            remaining = po_item.quantity - po_item.received_quantity
            
            if rec_qty > remaining:
                raise HTTPException(status_code=400, detail=f"Cannot receive {rec_qty} for Product {product_id}. Only {remaining} remaining.")
                
            # Update PO item
            po_item.received_quantity += rec_qty
            
            # Update Inventory
            inv = inv_map.get(product_id)
            if not inv:
                inv = Inventory(product_id=product_id, current_stock=0, incoming_stock=po_item.quantity) # If it didn't exist for some reason
                db.add(inv)
                
            inv.current_stock += rec_qty
            inv.incoming_stock = max(0, inv.incoming_stock - rec_qty)
            
            # Create Transaction
            txn = InventoryTransaction(
                product_id=product_id,
                transaction_type=TransactionType.purchase, # Note: using purchase as per plan
                quantity=rec_qty,
                reference_type="purchase_order",
                reference_id=po.id,
                notes=f"Received {rec_qty} units for PO {po.po_number}",
                created_by=user_id
            )
            db.add(txn)

        # Check total PO status
        all_delivered = True
        any_delivered = False
        
        for item in po.purchase_order_items:
            if item.received_quantity > 0:
                any_delivered = True
            if item.received_quantity < item.quantity:
                all_delivered = False
                
        if all_delivered:
            po.status = POStatus.delivered
        elif any_delivered:
            po.status = POStatus.partially_delivered
            
        db.commit()
        return PurchaseOrderService.get_po(db, po.id)

    # --- Summary ---

    @staticmethod
    def get_summary(db: Session) -> Dict[str, Any]:
        pos = db.query(PurchaseOrder).all()
        
        total = len(pos)
        draft = len([p for p in pos if p.status == POStatus.draft])
        pending = len([p for p in pos if p.status == POStatus.pending_approval])
        approved = len([p for p in pos if p.status == POStatus.approved])
        ordered = len([p for p in pos if p.status == POStatus.ordered])
        partially = len([p for p in pos if p.status == POStatus.partially_delivered])
        delivered = len([p for p in pos if p.status == POStatus.delivered])
        cancelled = len([p for p in pos if p.status == POStatus.cancelled])
        
        total_val = sum(p.total_amount for p in pos if p.status not in [POStatus.cancelled])
        pending_val = sum(p.total_amount for p in pos if p.status in [POStatus.pending_approval, POStatus.approved, POStatus.ordered, POStatus.partially_delivered])
        
        return {
            "total_purchase_orders": total,
            "draft_orders": draft,
            "pending_approval": pending,
            "approved": approved,
            "ordered": ordered,
            "partially_delivered": partially,
            "delivered": delivered,
            "cancelled": cancelled,
            "total_purchase_value": float(total_val),
            "pending_purchase_value": float(pending_val)
        }
