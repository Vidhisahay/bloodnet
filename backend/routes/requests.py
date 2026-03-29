from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import Donor, BloodRequest
from schemas import BloodRequestCreate, BloodRequestResponse, VALID_BLOOD_GROUPS
from typing import List
import json

router = APIRouter(
    prefix="/requests",
    tags=["Blood Requests"]
)

@router.post("/", response_model=BloodRequestResponse)
def create_blood_request(request: BloodRequestCreate, db: Session = Depends(get_db)):
    # Validate blood group
    if request.blood_group not in VALID_BLOOD_GROUPS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid blood group. Must be one of {VALID_BLOOD_GROUPS}"
        )

    new_request = BloodRequest(
        patient_name=request.patient_name,
        hospital_name=request.hospital_name,
        blood_group=request.blood_group,
        units_needed=request.units_needed,
        latitude=request.latitude,
        longitude=request.longitude,
        city=request.city,
        urgency=request.urgency
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


@router.get("/{request_id}/nearby-donors")
def get_nearby_donors(
    request_id: str,
    radius_km: float = 10,  # default search radius = 10km
    db: Session = Depends(get_db)
):
    # Fetch the blood request
    blood_request = db.query(BloodRequest).filter(
        BloodRequest.id == request_id
    ).first()

    if not blood_request:
        raise HTTPException(status_code=404, detail="Request not found")

    # This is the PostGIS magic
    # ST_DWithin checks if two geography points are within a distance
    # ST_MakePoint creates a geography point from lng, lat
    # Notice: PostGIS uses longitude FIRST, then latitude
    # 1000 * radius_km converts km to meters (PostGIS uses meters)
    query = text("""
        SELECT 
            id,
            name,
            blood_group,
            city,
            is_available,
            total_donations,
            latitude,
            longitude,
            ST_Distance(
                location,
                ST_MakePoint(:lng, :lat)::geography
            ) / 1000 AS distance_km
        FROM donors
        WHERE 
            blood_group = :blood_group
            AND is_available = true
            AND ST_DWithin(
                location,
                ST_MakePoint(:lng, :lat)::geography,
                :radius_meters
            )
        ORDER BY distance_km ASC
    """)

    result = db.execute(query, {
        "lat": blood_request.latitude,
        "lng": blood_request.longitude,
        "blood_group": blood_request.blood_group,
        "radius_meters": radius_km * 1000
    })

    donors = []
    for row in result.mappings():
        donors.append({
            "id": str(row["id"]),
            "name": row["name"],
            "blood_group": row["blood_group"],
            "city": row["city"],
            "is_available": row["is_available"],
            "total_donations": row["total_donations"],
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "distance_km": round(row["distance_km"], 2)
        })

    return {
        "request_id": request_id,
        "blood_group": blood_request.blood_group,
        "search_radius_km": radius_km,
        "donors_found": len(donors),
        "donors": donors
    }