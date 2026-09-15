from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from app.models.category import Category
from app.schemas.category import CategoryCreate
from typing import List

class CategoryService:
    @staticmethod
    def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
        return db.query(Category).offset(skip).limit(limit).all()

    @staticmethod
    def get_category(db: Session, category_id: int) -> Category:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category

    @staticmethod
    def create_category(db: Session, category_in: CategoryCreate) -> Category:
        db_category = Category(**category_in.model_dump())
        db.add(db_category)
        try:
            db.commit()
            db.refresh(db_category)
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="Category with this name already exists")
        return db_category
