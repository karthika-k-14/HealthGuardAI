import os
import logging
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

logger = logging.getLogger("health-ai-service.security")

JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "HealthGuardAIUltraSecureJWTSecretKeyMustBeAtLeast256BitsLongForHS512Algorithm!"
)
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS512")

security_scheme = HTTPBearer(auto_error=False)


def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and validates a Spring Boot generated JWT token using HS512/HS256.
    """
    try:
        # First try specified algorithm
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM, "HS256", "HS512"])
        return payload
    except JWTError as e:
        logger.warning(f"JWT Decoding failed: {e}")
        return None


def get_current_user_claims(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme)
) -> Optional[Dict[str, Any]]:
    """
    FastAPI dependency to extract claims from JWT token. Returns claims dict or None if invalid.
    """
    if not credentials:
        return None
    token = credentials.credentials
    return decode_jwt_token(token)
