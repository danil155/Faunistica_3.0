from fastapi import APIRouter, Request, Response, HTTPException
import logging

from .token import verify_token, create_access_token
from config.config import ACCESS_TOKEN_EXPIRE

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/refresh_token")
def refresh(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        logger.warning('Refresh token missing')
        raise HTTPException(status_code=403, detail="Refresh token missing")

    payload = verify_token(refresh_token)

    if payload.get("type") != "refresh":
        logger.warning('Invalid refresh token')
        raise HTTPException(status_code=403, detail="Invalid refresh token")

    user_id = payload.get("sub")
    username = payload.get("username")

    new_access_token = create_access_token({"sub": user_id, "username": username})

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=ACCESS_TOKEN_EXPIRE,
        path="/"
    )

    return {"message": "Access token refreshed"}
