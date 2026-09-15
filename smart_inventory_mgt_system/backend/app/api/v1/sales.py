from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database.connection import get_db
from app.schemas.sale import SaleCreate, SaleResponse, SaleListResponse, SalesSummaryResponse
from app.services.sale_service import SaleService

router = APIRouter()

@router.post("", response_model=SaleResponse, status_code=status.HTTP_201_CREATED, summary="Create a new sale")
def create_sale(sale_in: SaleCreate, db: Session = Depends(get_db)):
    """
    Create a new sale. Calculates totals on the backend and atomically deducts inventory.
    """
    return SaleService.create_sale(db, sale_in)

@router.get("/summary", response_model=SalesSummaryResponse, summary="Get sales summary metrics")
def get_sales_summary(db: Session = Depends(get_db)):
    """
    Retrieve sales dashboard summary metrics (today's sales, average order value, etc.).
    """
    return SaleService.get_summary(db)

@router.get("", response_model=SaleListResponse, summary="Get all sales")
def get_sales(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page"),
    payment_method: Optional[str] = Query(None, description="Filter by payment method"),
    sales_channel: Optional[str] = Query(None, description="Filter by sales channel"),
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    db: Session = Depends(get_db)
):
    """
    Retrieve sales list with pagination and filtering.
    """
    return SaleService.get_sales(
        db, 
        page=page, 
        page_size=page_size, 
        payment_method=payment_method, 
        sales_channel=sales_channel, 
        customer_id=customer_id
    )

@router.get("/{sale_id}", response_model=SaleResponse, summary="Get sale by ID")
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    """
    Retrieve detailed sale information including line items.
    """
    return SaleService.get_sale(db, sale_id)
