from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geography
from database import Base
from datetime import datetime
import uuid

class Donor(Base):
    __tablename__ = "donors"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    blood_group = Column(String, nullable=False)
    location = Column(Geography(geometry_type='POINT', srid=4326))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    city = Column(String, nullable=False)
    is_available = Column(Boolean, default=True)
    total_donations = Column(Integer, default=0)
    last_donation_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
