from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Donor
from schemas import DonorCreate, DonorResponse, VALID_BLOOD_GROUPS
from typing import List

router = APIRouter(prefix="/donors", tags=["Donors"])

@router.post("/register", response_model=DonorResponse)
def register_donor(donor: DonorCreate, db: Session = Depends(get_db)):
    if donor.blood_group not in VALID_BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid blood group")

    existing = db.query(Donor).filter(Donor.email == donor.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Build location string manually to avoid Windows escaping issues
    point = "SRID=4326;POINT(" + str(donor.longitude) + " " + str(donor.latitude) + ")"

    new_donor = Donor(
        name=donor.name,
        email=donor.email,
        phone=donor.phone,
        blood_group=donor.blood_group,
        latitude=donor.latitude,
        longitude=donor.longitude,
        city=donor.city,
        location=point
    )

    db.add(new_donor)
    db.commit()
    db.refresh(new_donor)
    return new_donor


@router.get("/", response_model=List[DonorResponse])
def get_all_donors(db: Session = Depends(get_db)):
    return db.query(Donor).all()