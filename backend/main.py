from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# FastAPI() creates your app — like Express() in Node
# The title/description show up in auto-generated docs
app = FastAPI(
    title="BloodNet API",
    description="Intelligent real-time blood donor matching system",
    version="1.0.0"
)

# CORS = Cross Origin Resource Sharing
# Without this, your React frontend CANNOT talk to this backend
# It's a browser security rule — we explicitly allow our frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite runs on 5173
    allow_credentials=True,
    allow_methods=["*"],   # allow GET, POST, PUT, DELETE etc
    allow_headers=["*"],
)

# Your first endpoint — always build a health check first
# Tells you instantly if the server is alive
# GET /health → returns JSON
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "BloodNet API",
        "version": "1.0.0"
    }