import redis
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to Redis
# decode_responses=True means we get strings back, not bytes
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True
)

def get_cached(key: str):
    """Get a value from cache. Returns None if not found."""
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception:
        # If Redis is down, return None and let the app continue
        return None

def set_cached(key: str, value: dict, ttl_seconds: int = 300):
    """
    Save a value to cache with expiry time.
    TTL = Time To Live — how long before cache expires
    Default 300 seconds = 5 minutes
    After TTL, Redis deletes it automatically
    """
    try:
        redis_client.setex(
            name=key,
            time=ttl_seconds,
            value=json.dumps(value)
        )
    except Exception:
        # If Redis is down, just skip caching silently
        pass

def delete_cached(key: str):
    """Delete a specific cache entry."""
    try:
        redis_client.delete(key)
    except Exception:
        pass

def build_cache_key(request_id: str, radius_km: float) -> str:
    """
    Build a consistent cache key for a search.
    Same request + same radius = same key = same cached result
    """
    return f"nearby_donors:{request_id}:radius:{radius_km}"