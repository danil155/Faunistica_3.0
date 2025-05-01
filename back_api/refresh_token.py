from fastapi import APIRouter, Request, Response, HTTPException
from .token import verify_token, create_access_token
from config.config import ACCESS_TOKEN_EXPIRE
from .rate_limiter import limiter

router = APIRouter()


@router.post("/refresh_token")
@limiter.limit("3/minute")
def refresh(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    payload = verify_token(refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

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
