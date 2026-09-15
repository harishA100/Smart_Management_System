from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database.connection import get_db
from app.schemas.supplier import (
    SupplierCreate, SupplierUpdate, SupplierResponse, SupplierListResponse,
    SupplierProductCreate, SupplierProductUpdate, SupplierProductResponse,
    SupplierPerformanceResponse, SupplierComparisonResponse
)
from app.services.supplier_service import SupplierService

router = APIRouter()

# --- Supplier Endpoints ---

@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED, summary="Create a new supplier")
def create_supplier(supplier_in: SupplierCreate, db: Session = Depends(get_db)):
    """
    Create a new supplier.
    """
    return SupplierService.create_supplier(db, supplier_in)

@router.get("", response_model=SupplierListResponse, summary="Get all suppliers")
def get_suppliers(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page"),
    name: Optional[str] = Query(None, description="Filter by supplier name"),
    contact_person: Optional[str] = Query(None, description="Filter by contact person"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db)
):
    """
    Retrieve suppliers with pagination and filtering.
    """
    return SupplierService.get_suppliers(
        db, page=page, page_size=page_size, name=name, 
        contact_person=contact_person, is_active=is_active
    )

@router.get("/compare/{product_id}", response_model=SupplierComparisonResponse, summary="Compare suppliers for a product")
def compare_suppliers(product_id: int, db: Session = Depends(get_db)):
    """
    Compare all active suppliers that provide a specific product.
    Suppliers are ranked by a deterministic score evaluating price, lead time, quality, and performance.
    """
    return SupplierService.compare_suppliers(db, product_id)

@router.get("/{supplier_id}", response_model=SupplierResponse, summary="Get supplier by ID")
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """
    Retrieve supplier details.
    """
    return SupplierService.get_supplier(db, supplier_id)

@router.put("/{supplier_id}", response_model=SupplierResponse, summary="Update supplier")
def update_supplier(supplier_id: int, supplier_in: SupplierUpdate, db: Session = Depends(get_db)):
    """
    Update supplier information.
    """
    return SupplierService.update_supplier(db, supplier_id, supplier_in)

@router.delete("/{supplier_id}", response_model=SupplierResponse, summary="Delete supplier")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """
    Delete a supplier (soft delete).
    """
    return SupplierService.delete_supplier(db, supplier_id)

# --- Supplier Product Endpoints ---

@router.post("/{supplier_id}/products", response_model=SupplierProductResponse, status_code=status.HTTP_201_CREATED, summary="Add product to supplier")
def add_product_to_supplier(supplier_id: int, product_in: SupplierProductCreate, db: Session = Depends(get_db)):
    """
    Associate a product with a supplier.
    """
    return SupplierService.add_product_to_supplier(db, supplier_id, product_in)

@router.get("/{supplier_id}/products", response_model=List[SupplierProductResponse], summary="Get supplier products")
def get_supplier_products(supplier_id: int, db: Session = Depends(get_db)):
    """
    Retrieve all products supplied by a specific supplier.
    """
    return SupplierService.get_supplier_products(db, supplier_id)

@router.put("/{supplier_id}/products/{product_id}", response_model=SupplierProductResponse, summary="Update supplier product")
def update_supplier_product(supplier_id: int, product_id: int, update_in: SupplierProductUpdate, db: Session = Depends(get_db)):
    """
    Update the association details between a supplier and a product (e.g. price, MOQ, lead time).
    """
    return SupplierService.update_supplier_product(db, supplier_id, product_id, update_in)

@router.delete("/{supplier_id}/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove supplier product")
def remove_supplier_product(supplier_id: int, product_id: int, db: Session = Depends(get_db)):
    """
    Remove the association between a supplier and a product.
    """
    SupplierService.remove_supplier_product(db, supplier_id, product_id)

# --- Supplier Performance Endpoints ---

@router.get("/{supplier_id}/performance", response_model=SupplierPerformanceResponse, summary="Get supplier performance metrics")
def get_supplier_performance(supplier_id: int, db: Session = Depends(get_db)):
    """
    Calculate and retrieve performance metrics for a supplier based on historical purchase orders.
    """
    return SupplierService.get_supplier_performance(db, supplier_id)
