from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid

# List of valid blood groups — anything else gets rejected
VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

# What data we ACCEPT when registering a donor
class DonorCreate(BaseModel):
    name: str
    email: EmailStr        # validates email format automatically
    phone: str
    blood_group: str
    latitude: float
    longitude: float
    city: str

# What data we RETURN when someone requests donor info
class DonorResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: str
    blood_group: str
    city: str
    is_available: bool
    total_donations: int
    created_at: datetime

    class Config:
        from_attributes = True  # allows converting DB object to this schema

# What data we ACCEPT when creating a blood request
class BloodRequestCreate(BaseModel):
    patient_name: str
    hospital_name: str
    blood_group: str
    units_needed: float
    latitude: float
    longitude: float
    city: str
    urgency: str = "normal"   # default is normal

# What data we RETURN for a blood request
class BloodRequestResponse(BaseModel):
    id: uuid.UUID
    patient_name: str
    hospital_name: str
    blood_group: str
    units_needed: float
    city: str
    urgency: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True