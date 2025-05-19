from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from back_api.schemas import PublResponse
from database.database import get_session
from database.crud import username_and_publication
from .rate_limiter import limiter
from .token import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()
base_url = "https://faunistica.ru/files/"


@router.get("/get_publ")
@limiter.limit("666/minute")
async def insert_record(
        request: Request,
        user_data: dict = Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
):
    try:
        data = await username_and_publication(session, int(user_data["sub"]))

        return PublResponse(
            author=data["publication"]["author"],
            year=data["publication"]["year"],
            name=data["publication"]["name"],
            pdf_file=base_url + data["publication"]["pdf_file"]
        )
    except Exception as e:
        logger.error(f' HTTP Error: {e}', exc_info=True)
        raise HTTPException(status_code=500, detail=f"Server database error: {str(e)}")
