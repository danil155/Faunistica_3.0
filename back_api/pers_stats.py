from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from .schemas import StatisticsResponse
from database.crud import get_user_stats, get_user, get_personal_stats
from database.database import get_session
from .rate_limiter import limiter
from .token import get_current_user

router = APIRouter()


@router.get("/get_pers_stats", response_model=StatisticsResponse)
@limiter.limit("60/minute")
async def get_gen_stats(
        request: Request,
        user_data: dict = Depends(get_current_user),
        session: AsyncSession = Depends(get_session)
):
    user_id = int(user_data["sub"])
    user_info = await get_user(session, user_id)
    username = user_info.name
    stats = get_user_stats(session, user_id)
    table_stats = get_personal_stats(session, user_id)
    return username, user_id, stats, table_stats
