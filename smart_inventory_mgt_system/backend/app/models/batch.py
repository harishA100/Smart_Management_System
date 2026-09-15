from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class ProductBatch(Base):
    __tablename__ = "product_batches"

    id = Column(String(50), primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    store_id = Column(String(20), ForeignKey("stores.id"), nullable=False)
    batch_number = Column(String(100), nullable=False)
    received_date = Column(Date, nullable=False)
    manufacturing_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    initial_quantity = Column(Integer, nullable=False)
    remaining_quantity = Column(Integer, nullable=False)
    unit_cost = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), nullable=False)

    # relationships
    product = relationship("Product")
    store = relationship("Store", back_populates="batches")
