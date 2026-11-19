"""JWT authentication for the agent service.

Validates the Bearer token issued by auth-service (HS256, shared JWT_SECRET)
and returns the verified user id plus the raw token so it can be forwarded
to downstream Java services, which perform their own signature verification.
"""
from typing import NamedTuple

import jwt
from fastapi import Header, HTTPException

from . import config


class AuthContext(NamedTuple):
    user_id: str
    token: str


def get_auth(authorization: str | None = Header(default=None)) -> AuthContext:
    if not config.JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT_SECRET is not configured")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization[7:]
    try:
        claims = jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = claims.get("userId")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    return AuthContext(user_id=str(user_id), token=token)
