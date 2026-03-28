from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Donor
from schemas import DonorCreate, DonorResponse, VALID_BLOOD_GROUPS
from typing import List

# APIRouter is like a mini-app — groups related endpoints
# We mount this onto the main app in main.py
router = APIRouter(
    prefix="/donors",     # all routes here start with /donors
    tags=["Donors"]       # groups them in /docs page
)

@router.post("/register", response_model=DonorResponse)
def register_donor(donor: DonorCreate, db: Session = Depends(get_db)):
    # Validate blood group
    if donor.blood_group not in VALID_BLOOD_GROUPS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid blood group. Must be one of {VALID_BLOOD_GROUPS}"
        )
    
    # Check if email already registered
    existing = db.query(Donor).filter(Donor.email == donor.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new donor object
    new_donor = Donor(
        name=donor.name,
        email=donor.email,
        phone=donor.phone,
        blood_group=donor.blood_group,
        latitude=donor.latitude,
        longitude=donor.longitude,
        city=donor.city
    )
    
    # Save to database
    db.add(new_donor)
    db.commit()
    db.refresh(new_donor)  # gets the saved object back with ID
    
    return new_donor


@router.get("/", response_model=List[DonorResponse])
def get_all_donors(db: Session = Depends(get_db)):
    donors = db.query(Donor).all()
    return donors