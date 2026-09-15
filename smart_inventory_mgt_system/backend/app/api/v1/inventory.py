from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database.connection import get_db
from app.schemas.inventory import (
    InventoryResponse, InventoryListResponse, InventorySummaryResponse,
    StockReceiveRequest, StockAdjustmentRequest, StockDamageRequest, 
    StockExpiryRequest, InventoryTransactionListResponse
)
from app.services.inventory import InventoryService

router = APIRouter()

@router.get("/summary", response_model=InventorySummaryResponse, summary="Get inventory summary metrics")
def get_inventory_summary(db: Session = Depends(get_db)):
    """
    Retrieve global inventory metrics for dashboard views.
    """
    return InventoryService.get_summary(db)

@router.get("", response_model=InventoryListResponse, summary="Get all inventory")
def get_inventory(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page"),
    search: Optional[str] = Query(None, description="Search by product name, SKU, or barcode"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    status: Optional[str] = Query(None, description="Filter by stock status (in_stock, low_stock, out_of_stock)"),
    db: Session = Depends(get_db)
):
    """
    Retrieve inventory list with pagination, searching, and filtering.
    """
    return InventoryService.get_inventory(
        db, page=page, page_size=page_size, search=search, category_id=category_id, status=status
    )

@router.get("/{product_id}", response_model=InventoryResponse, summary="Get inventory by product")
def get_inventory_by_product(product_id: int, db: Session = Depends(get_db)):
    """
    Retrieve current inventory state for a specific product.
    """
    return InventoryService.get_inventory_by_product(db, product_id)

@router.post("/{product_id}/receive", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED, summary="Receive stock")
def receive_stock(product_id: int, req: StockReceiveRequest, db: Session = Depends(get_db)):
    """
    Record stock receipt (purchase or inbound delivery) and update inventory.
    """
    return InventoryService.receive_stock(db, product_id, req)

@router.post("/{product_id}/adjust", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED, summary="Adjust stock manually")
def adjust_stock(product_id: int, req: StockAdjustmentRequest, db: Session = Depends(get_db)):
    """
    Manually adjust stock levels for corrections.
    """
    return InventoryService.adjust_stock(db, product_id, req)

@router.post("/{product_id}/damage", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED, summary="Record damaged stock")
def damage_stock(product_id: int, req: StockDamageRequest, db: Session = Depends(get_db)):
    """
    Record damaged stock and reduce available inventory.
    """
    return InventoryService.damage_stock(db, product_id, req)

@router.post("/{product_id}/expire", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED, summary="Record expired stock")
def expire_stock(product_id: int, req: StockExpiryRequest, db: Session = Depends(get_db)):
    """
    Record expired stock and reduce available inventory.
    """
    return InventoryService.expire_stock(db, product_id, req)

@router.get("/{product_id}/transactions", response_model=InventoryTransactionListResponse, summary="Get inventory transaction history")
def get_transactions(
    product_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page"),
    transaction_type: Optional[str] = Query(None, description="Filter by transaction type"),
    db: Session = Depends(get_db)
):
    """
    Retrieve transaction history for a specific product.
    """
    return InventoryService.get_transactions(
        db, product_id=product_id, page=page, page_size=page_size, transaction_type=transaction_type
    )
