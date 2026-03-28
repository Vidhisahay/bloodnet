from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models import Donor, BloodRequest

# This creates all tables in PostgreSQL automatically
# No need to write SQL manually
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BloodNet API",
    description="Intelligent real-time blood donor matching system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    try:
        with engine.connect() as conn:
            return {
                "status": "online",
                "service": "BloodNet API",
                "version": "1.0.0",
                "database": "connected"
            }
    except Exception as e:
        return {
            "status": "online",
            "database": f"error: {str(e)}"
        }