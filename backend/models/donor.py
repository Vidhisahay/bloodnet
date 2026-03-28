from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from database import Base
from datetime import datetime
import uuid

class Donor(Base):
    # This becomes the table name in PostgreSQL
    __tablename__ = "donors"

    # UUID is better than 1,2,3 IDs — more secure, used in production
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    blood_group = Column(String, nullable=False)  # A+, B-, O+, AB+ etc
    
    # Location — we store lat/lng for geospatial search later
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    city = Column(String, nullable=False)
    
    # Availability and history
    is_available = Column(Boolean, default=True)
    total_donations = Column(Integer, default=0)
    last_donation_date = Column(DateTime, nullable=True)
    
    # When was this record created
    created_at = Column(DateTime, default=datetime.utcnow)