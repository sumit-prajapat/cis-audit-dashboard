"""CSRF protection middleware for state-changing requests."""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from fastapi import status


class CSRFMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, exempt_paths=None):
        super().__init__(app)
        self.exempt_paths = set(exempt_paths or [])

    async def dispatch(self, request, call_next):
        if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
            path = request.url.path
            if path not in self.exempt_paths:
                refresh_cookie = request.cookies.get("refresh_token")
                auth_header = request.headers.get("Authorization", "")
                uses_bearer_token = auth_header.startswith("Bearer ")
                if refresh_cookie and not uses_bearer_token:
                    csrf_cookie = request.cookies.get("csrf_token")
                    csrf_header = request.headers.get("X-CSRF-Token")
                    if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
                        return JSONResponse(
                            status_code=status.HTTP_403_FORBIDDEN,
                            content={"detail": "CSRF token validation failed"},
                        )
        return await call_next(request)
