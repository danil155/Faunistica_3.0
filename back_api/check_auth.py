from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from database.database import get_session
from .rate_limiter import limiter
from .token import get_current_user

router = APIRouter()


@router.post("/check_auth")
@limiter.limit("60/minute")
async def check_auth(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_session),
    user: dict = Depends(get_current_user)
):
    return {"authenticated": True, "user_id": user["sub"], "username": user["username"]}
