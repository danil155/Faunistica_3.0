from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from .schemas import StatisticsResponse
from database.crud import get_statistics
from database.database import get_session
from .rate_limiter import limiter

router = APIRouter()


@router.get("/get_gen_stats", response_model=StatisticsResponse)
@limiter.limit("60/minute")
async def get_gen_stats(
        request: Request,
        session: AsyncSession = Depends(get_session)
):
    return await get_statistics(session)
