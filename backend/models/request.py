from sqlalchemy import Column, String, Float, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from database import Base
from datetime import datetime
import uuid

class BloodRequest(Base):
    __tablename__ = "blood_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Who needs blood
    patient_name = Column(String, nullable=False)
    hospital_name = Column(String, nullable=False)
    blood_group = Column(String, nullable=False)
    units_needed = Column(Float, nullable=False)
    
    # Location of hospital
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    city = Column(String, nullable=False)
    
    # urgent / normal
    urgency = Column(String, default="normal")
    
    # pending / matched / fulfilled
    status = Column(String, default="pending")
    
    created_at = Column(DateTime, default=datetime.utcnow)