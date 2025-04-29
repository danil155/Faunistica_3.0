from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .schemas import StatisticsResponse
from database.crud import get_statistics
from database.database import get_session
from app import limiter

router = APIRouter()


@router.get("/get_gen_stats", response_model=StatisticsResponse)
@limiter.limit("1/second")
async def get__gen_stats(session: AsyncSession = Depends(get_session)):
    return await get_statistics(session)
