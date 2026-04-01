import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from models.donor import Donor
from models.request import BloodRequest
import uuid
from datetime import datetime, timedelta
import random

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Clear existing data
db.query(Donor).delete()
db.query(BloodRequest).delete()
db.commit()

# Realistic Indian cities with coordinates
CITIES = [
    {"city": "Delhi", "lat": 28.6139, "lng": 77.2090},
    {"city": "Mumbai", "lat": 19.0760, "lng": 72.8777},
    {"city": "Bangalore", "lat": 12.9716, "lng": 77.5946},
    {"city": "Chennai", "lat": 13.0827, "lng": 80.2707},
    {"city": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
    {"city": "Pune", "lat": 18.5204, "lng": 73.8567},
    {"city": "Kolkata", "lat": 22.5726, "lng": 88.3639},
    {"city": "Jaipur", "lat": 26.9124, "lng": 75.7873},
]

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

NAMES = [
    "Priya Sharma", "Rahul Verma", "Anjali Singh", "Amit Kumar",
    "Sneha Patel", "Rohit Gupta", "Pooja Mehta", "Vikas Yadav",
    "Neha Joshi", "Arjun Nair", "Divya Reddy", "Sanjay Iyer",
    "Kavya Pillai", "Manish Tiwari", "Ritu Agarwal", "Deepak Shah",
    "Ananya Bose", "Kiran Rao", "Suresh Mishra", "Lakshmi Naidu",
    "Vijay Patil", "Sunita Devi", "Rajesh Chauhan", "Meera Krishnan",
    "Arun Saxena", "Preeti Chandra", "Nikhil Jain", "Swati Pandey",
    "Mohit Srivastava", "Rekha Nambiar"
]

print("Seeding donors...")

donors_created = 0
for city_data in CITIES:
    # Add 8-12 donors per city
    num_donors = random.randint(8, 12)
    for i in range(num_donors):
        # Slightly randomize location within city (within ~5km)
        lat = city_data["lat"] + random.uniform(-0.03, 0.03)
        lng = city_data["lng"] + random.uniform(-0.03, 0.03)

        blood_group = random.choice(BLOOD_GROUPS)
        name = random.choice(NAMES)
        total_donations = random.randint(0, 15)

        # Some donors donated recently, some didn't
        if total_donations > 0:
            days_ago = random.randint(90, 365)
            last_donation = datetime.utcnow() - timedelta(days=days_ago)
        else:
            last_donation = None

        donor = Donor(
            id=uuid.uuid4(),
            name=name,
            email=f"{name.lower().replace(' ','.')}.{city_data['city'].lower()}.{i}@example.com",
            phone=f"9{random.randint(100000000, 999999999)}",
            blood_group=blood_group,
            latitude=lat,
            longitude=lng,
            city=city_data["city"],
            location=f"SRID=4326;POINT({lng} {lat})",
            is_available=random.choice([True, True, True, False]),  # 75% available
            total_donations=total_donations,
            last_donation_date=last_donation,
            created_at=datetime.utcnow()
        )
        db.add(donor)
        donors_created += 1

db.commit()
print(f"Created {donors_created} donors across {len(CITIES)} cities")

# Add sample blood requests
print("Seeding blood requests...")

requests_created = 0
HOSPITALS = [
    "AIIMS Delhi", "Apollo Hospital", "Fortis Hospital",
    "Max Hospital", "Manipal Hospital", "Lilavati Hospital"
]

for city_data in CITIES[:4]:  # requests in first 4 cities
    for _ in range(2):
        lat = city_data["lat"] + random.uniform(-0.01, 0.01)
        lng = city_data["lng"] + random.uniform(-0.01, 0.01)

        req = BloodRequest(
            id=uuid.uuid4(),
            patient_name=random.choice(NAMES),
            hospital_name=random.choice(HOSPITALS),
            blood_group=random.choice(BLOOD_GROUPS),
            units_needed=random.choice([1, 2, 3]),
            latitude=lat,
            longitude=lng,
            city=city_data["city"],
            urgency=random.choice(["normal", "urgent", "critical"]),
            status="pending",
            created_at=datetime.utcnow()
        )
        db.add(req)
        requests_created += 1

db.commit()
print(f"Created {requests_created} blood requests")

db.close()
print("\nSeed complete!")
print(f"Total: {donors_created} donors, {requests_created} requests")
print("\nTest these cities: Delhi, Mumbai, Bangalore, Chennai")
print("All blood groups available in each city")