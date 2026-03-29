from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import joblib
import numpy as np
from datetime import datetime

app = FastAPI(
    title="BloodNet ML Service",
    description="Donor response prediction using XGBoost",
    version="1.0.0"
)

# Load model once when service starts
# joblib loads the saved .pkl file
model = joblib.load("model.pkl")

# What data we accept for scoring
class DonorFeatures(BaseModel):
    distance_km: float
    total_donations: int
    is_available: bool
    days_since_last_donation: float
    hour_of_day: int

# Score multiple donors at once (batch scoring)
class BatchScoreRequest(BaseModel):
    donors: List[DonorFeatures]

@app.get("/health")
def health():
    return {"status": "online", "service": "BloodNet ML Service"}

@app.post("/score")
def score_donors(request: BatchScoreRequest):
    # Build feature matrix from all donors
    features = []
    for donor in request.donors:
        features.append([
            donor.distance_km,
            donor.total_donations,
            int(donor.is_available),
            donor.days_since_last_donation,
            donor.hour_of_day
        ])

    X = np.array(features)

    # predict_proba returns [prob_no_response, prob_response]
    # We take index [1] = probability of responding
    probabilities = model.predict_proba(X)[:, 1]

    # Return score for each donor
    scores = []
    for i, donor in enumerate(request.donors):
        scores.append({
            "response_probability": round(float(probabilities[i]), 3),
            "score_label": "high" if probabilities[i] > 0.7
                          else "medium" if probabilities[i] > 0.4
                          else "low"
        })

    return {"scores": scores}