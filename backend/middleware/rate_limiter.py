"""
rate_limiter.py - Request rate limiting middleware
"""
from fastapi import Request, HTTPException, status
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from collections import defaultdict
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

class RateLimiter:
    """In-memory rate limiter (use Redis for distributed deployments)"""
    
    def __init__(self):
        self.requests = defaultdict(list)
        self.limits = {
            "global": 10000,      # 10,000 per hour globally
            "per_org": 5000,      # 5,000 per hour per organization
            "per_ip": 1000,       # 1,000 per hour per IP
            "auth": 10,           # 10 login attempts per 15 minutes
        }
    
    def check_rate_limit(
        self,
        identifier: str,
        limit_type: str = "per_org",
        window_seconds: int = 3600
    ) -> bool:
        """Check if request is within rate limit"""
        now = time.time()
        key = f"{limit_type}:{identifier}"
        
        # Remove old requests outside the window
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if now - req_time < window_seconds
        ]
        
        # Check against limit
        limit = self.limits.get(limit_type, 1000)
        if len(self.requests[key]) >= limit:
            return False
        
        # Record this request
        self.requests[key].append(now)
        return True
    
    def get_remaining(
        self,
        identifier: str,
        limit_type: str = "per_org"
    ) -> int:
        """Get remaining requests in current window"""
        key = f"{limit_type}:{identifier}"
        limit = self.limits.get(limit_type, 1000)
        return max(0, limit - len(self.requests.get(key, [])))


rate_limiter = RateLimiter()


class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_limit: int = 5000, window_seconds: int = 3600):
        super().__init__(app)
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds

    async def dispatch(self, request: Request, call_next):
        if request.url.path in ["/health", "/ready", "/api/docs", "/api/openapi.json"]:
            return await call_next(request)

        client_ip = request.client.host if request.client else "anonymous"
        if not rate_limiter.check_rate_limit(client_ip, "global", window_seconds=self.window_seconds):
            return Response(
                content='{"detail":"Too many requests"}',
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                media_type="application/json",
            )

        return await call_next(request)


async def rate_limit_middleware(request: Request, db: Session = None):
    """Apply rate limiting to requests"""
    
    # Skip rate limiting for health checks
    if request.url.path in ["/health", "/ready", "/api/docs", "/api/openapi.json"]:
        return
    
    # Get rate limit identifier
    client_ip = request.client.host
    org_id = request.headers.get("X-Org-ID", "anonymous")
    
    # Check IP-based rate limit (stricter)
    if not rate_limiter.check_rate_limit(client_ip, "per_ip"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests from your IP. Limit: 1000/hour"
        )
    
    # Check organization rate limit
    if org_id != "anonymous":
        if not rate_limiter.check_rate_limit(org_id, "per_org"):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Organization rate limit exceeded. Limit: 5000/hour"
            )
    
    # Check auth endpoint rate limit (stricter for security)
    if "auth" in request.url.path and request.method == "POST":
        if not rate_limiter.check_rate_limit(client_ip, "auth", window_seconds=900):  # 15 minutes
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please try again later."
            )
