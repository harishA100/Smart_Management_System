from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from app.database.connection import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.services.product import ProductService

router = APIRouter()

@router.get("", response_model=ProductListResponse, summary="Get all products")
def get_products(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page"),
    search: Optional[str] = Query(None, description="Search by name, SKU, barcode, or brand"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db)
):
    """
    Retrieve products with pagination, search, and filtering.
    """
    return ProductService.get_products(
        db, 
        page=page, 
        page_size=page_size, 
        search=search, 
        category_id=category_id, 
        is_active=is_active
    )

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED, summary="Create a product")
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """
    Create a new product.
    """
    return ProductService.create_product(db, product_in=product_in)

@router.get("/{product_id}", response_model=ProductResponse, summary="Get a product by ID")
def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific product by its ID.
    """
    return ProductService.get_product(db, product_id=product_id)

@router.put("/{product_id}", response_model=ProductResponse, summary="Update a product")
def update_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    """
    Update a specific product by its ID.
    """
    return ProductService.update_product(db, product_id=product_id, product_in=product_in)

@router.delete("/{product_id}", summary="Soft delete a product")
def delete_product(product_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Soft delete a specific product by marking it inactive.
    """
    return ProductService.soft_delete_product(db, product_id=product_id)
