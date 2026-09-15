from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from app.database.connection import get_db
from app.schemas.purchase_order import (
    PurchaseOrderCreate, PurchaseOrderResponse, PurchaseOrderListResponse,
    RejectionReason, CancellationReason, PurchaseOrderReceive,
    PurchaseOrderSummaryResponse
)
from app.services.purchase_order_service import PurchaseOrderService

router = APIRouter()

@router.post("", response_model=PurchaseOrderResponse, status_code=status.HTTP_201_CREATED, summary="Create a new purchase order")
def create_purchase_order(po_in: PurchaseOrderCreate, db: Session = Depends(get_db)):
    """
    Create a new Purchase Order in draft status.
    Calculates subtotal, tax, and total automatically from the supplier's product price.
    """
    return PurchaseOrderService.create_po(db, po_in)

@router.get("/summary", response_model=PurchaseOrderSummaryResponse, summary="Get PO summary metrics")
def get_po_summary(db: Session = Depends(get_db)):
    """
    Retrieve summary statistics for purchase orders.
    """
    return PurchaseOrderService.get_summary(db)

@router.get("", response_model=PurchaseOrderListResponse, summary="Get all purchase orders")
def get_purchase_orders(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page"),
    status: Optional[str] = Query(None, description="Filter by PO status"),
    supplier_id: Optional[int] = Query(None, description="Filter by supplier ID"),
    po_number: Optional[str] = Query(None, description="Search by PO number"),
    start_date: Optional[date] = Query(None, description="Filter start date"),
    end_date: Optional[date] = Query(None, description="Filter end date"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of purchase orders with pagination and filtering.
    """
    return PurchaseOrderService.get_pos(
        db, page=page, page_size=page_size, status=status, 
        supplier_id=supplier_id, po_number=po_number,
        start_date=start_date, end_date=end_date
    )

@router.get("/{po_id}", response_model=PurchaseOrderResponse, summary="Get purchase order by ID")
def get_purchase_order(po_id: int, db: Session = Depends(get_db)):
    """
    Retrieve full details of a specific purchase order.
    """
    return PurchaseOrderService.get_po(db, po_id)

@router.post("/{po_id}/submit", response_model=PurchaseOrderResponse, summary="Submit PO for approval")
def submit_purchase_order(po_id: int, db: Session = Depends(get_db)):
    """
    Change PO status from draft to pending_approval.
    """
    return PurchaseOrderService.submit_po(db, po_id)

@router.post("/{po_id}/approve", response_model=PurchaseOrderResponse, summary="Approve PO")
def approve_purchase_order(po_id: int, db: Session = Depends(get_db)):
    """
    Change PO status from pending_approval to approved.
    """
    return PurchaseOrderService.approve_po(db, po_id)

@router.post("/{po_id}/reject", response_model=PurchaseOrderResponse, summary="Reject PO")
def reject_purchase_order(po_id: int, reason: RejectionReason, db: Session = Depends(get_db)):
    """
    Change PO status from pending_approval to rejected.
    """
    return PurchaseOrderService.reject_po(db, po_id, reason)

@router.post("/{po_id}/order", response_model=PurchaseOrderResponse, summary="Mark PO as ordered")
def order_purchase_order(po_id: int, db: Session = Depends(get_db)):
    """
    Change PO status from approved to ordered. Also updates incoming_stock.
    """
    return PurchaseOrderService.order_po(db, po_id)

@router.post("/{po_id}/cancel", response_model=PurchaseOrderResponse, summary="Cancel PO")
def cancel_purchase_order(po_id: int, reason: CancellationReason, db: Session = Depends(get_db)):
    """
    Cancel the PO. Reverts incoming_stock if it was already ordered.
    """
    return PurchaseOrderService.cancel_po(db, po_id, reason)

@router.post("/{po_id}/receive", response_model=PurchaseOrderResponse, summary="Receive stock for PO")
def receive_purchase_order(po_id: int, receive_in: PurchaseOrderReceive, db: Session = Depends(get_db)):
    """
    Receive items for a PO. 
    Updates PO item received quantity, updates Inventory (atomic), and creates InventoryTransactions.
    Changes PO status to partially_delivered or delivered.
    """
    return PurchaseOrderService.receive_po(db, po_id, receive_in)
