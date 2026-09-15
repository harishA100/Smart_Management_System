from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.schemas.category import CategoryCreate, CategoryResponse
from app.services.category import CategoryService

router = APIRouter()

@router.get("", response_model=List[CategoryResponse], summary="Get all categories")
def get_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve a list of categories.
    """
    return CategoryService.get_categories(db, skip=skip, limit=limit)

@router.post("", response_model=CategoryResponse, status_code=201, summary="Create a category")
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db)):
    """
    Create a new category.
    """
    return CategoryService.create_category(db, category_in=category_in)
