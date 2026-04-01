import redis
import json
import os
from dotenv import load_dotenv

load_dotenv()

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD", None),
    decode_responses=True,
    ssl=True   # Redis Cloud requires SSL
)

def get_cached(key: str):
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception:
        return None

def set_cached(key: str, value: dict, ttl_seconds: int = 300):
    try:
        redis_client.setex(
            name=key,
            time=ttl_seconds,
            value=json.dumps(value)
        )
    except Exception:
        pass

def delete_cached(key: str):
    try:
        redis_client.delete(key)
    except Exception:
        pass

def build_cache_key(request_id: str, radius_km: float) -> str:
    return f"nearby_donors:{request_id}:radius:{radius_km}"