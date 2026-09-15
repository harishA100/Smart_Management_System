from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(String(20), primary_key=True, index=True)
    store_name = Column(String(100), nullable=False)
    region = Column(String(50), nullable=False)
    store_type = Column(String(50), nullable=False)
    selling_area_sqft = Column(Integer, nullable=False)

    # relationships
    batches = relationship("ProductBatch", back_populates="store")
