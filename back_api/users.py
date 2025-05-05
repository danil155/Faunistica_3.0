from fastapi import APIRouter, HTTPException, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from .schemas import UserRequest
from database.crud import get_user_id_by_username, is_pass_correct
from database.database import get_session
from .rate_limiter import limiter
from .token import create_access_token, create_refresh_token
from config.config import ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN_EXPIRE

router = APIRouter()


@router.post("/get_user")
@limiter.limit("15/minute")
async def handle_user_data(
        request: Request,
        response: Response,
        data: UserRequest,
        session: AsyncSession = Depends(get_session)
):
    user_id = await get_user_id_by_username(session, data.username)
    if user_id == -1:
        raise HTTPException(status_code=404, detail="User not found for this username")

    if not await is_pass_correct(session, user_id, data.password):
        raise HTTPException(status_code=401, detail="Wrong password")

    token_payload = {"sub": str(user_id), "username": data.username}
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,   # Set to True for https
        samesite="strict",
        max_age=ACCESS_TOKEN_EXPIRE * 60,
        path="/",
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,   # Set to True for https
        samesite="strict",
        max_age=REFRESH_TOKEN_EXPIRE * 60,
        path="/",
    )

    return {"message": "OK"}
