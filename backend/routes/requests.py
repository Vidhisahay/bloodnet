from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import BloodRequest
from schemas import BloodRequestCreate, BloodRequestResponse, VALID_BLOOD_GROUPS
from cache import get_cached, set_cached, delete_cached, build_cache_key
from datetime import datetime
import httpx
import os

router = APIRouter(
    prefix="/requests",
    tags=["Blood Requests"]
)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8001")

@router.post("/", response_model=BloodRequestResponse)
def create_blood_request(request: BloodRequestCreate, db: Session = Depends(get_db)):
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
    radius_km: float = 10,
    db: Session = Depends(get_db)
):
    # Step 1 — Check cache first
    # If we already searched this request+radius, return instantly
    cache_key = build_cache_key(request_id, radius_km)
    cached_result = get_cached(cache_key)

    if cached_result:
        # Cache hit — return immediately, no DB or ML call needed
        cached_result["cache"] = "hit"
        return cached_result

    # Cache miss — do the full search
    blood_request = db.query(BloodRequest).filter(
        BloodRequest.id == request_id
    ).first()

    if not blood_request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Step 2 — PostGIS geospatial search
    query = text("""
        SELECT
            id, name, phone, blood_group, city,
            is_available, total_donations,
            latitude, longitude,
            last_donation_date,
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

    donors = [dict(row) for row in result.mappings()]

    if not donors:
        return {
            "request_id": request_id,
            "blood_group": blood_request.blood_group,
            "search_radius_km": radius_km,
            "donors_found": 0,
            "donors": [],
            "cache": "miss"
        }

    # Step 3 — ML scoring
    now = datetime.utcnow()
    ml_payload = {"donors": []}

    for donor in donors:
        last_donation = donor.get("last_donation_date")
        days_since = (now - last_donation).days if last_donation else 365

        ml_payload["donors"].append({
            "distance_km": donor["distance_km"],
            "total_donations": donor["total_donations"],
            "is_available": donor["is_available"],
            "days_since_last_donation": float(days_since),
            "hour_of_day": now.hour
        })

    try:
        response = httpx.post(
            f"{ML_SERVICE_URL}/score",
            json=ml_payload,
            timeout=5.0
        )
        scores = response.json()["scores"]
    except Exception:
        scores = [{"response_probability": 0.5, "score_label": "unknown"}
                  for _ in donors]

    # Step 4 — Merge and rank
    for i, donor in enumerate(donors):
        donor["id"] = str(donor["id"])
        donor["distance_km"] = round(donor["distance_km"], 2)
        donor["response_probability"] = scores[i]["response_probability"]
        donor["score_label"] = scores[i]["score_label"]
        donor.pop("last_donation_date", None)

    donors.sort(key=lambda x: x["response_probability"], reverse=True)

    # Step 5 — Build result and cache it
    result_data = {
        "request_id": request_id,
        "blood_group": blood_request.blood_group,
        "search_radius_km": radius_km,
        "donors_found": len(donors),
        "donors": donors,
        "cache": "miss"   # first time = miss
    }

    # Cache for 5 minutes
    # Why 5 minutes? Donor availability can change — stale data is risky
    # in a medical context so we keep TTL short
    set_cached(cache_key, result_data, ttl_seconds=300)

    return result_data