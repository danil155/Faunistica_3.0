from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from back_api.schemas import RecordHashRequest, PublResponse
from database.database import get_session
from database.hash import decrypt_id
from database.crud import publ_by_hash
from .rate_limiter import limiter
from .token import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()
base_url = "https://faunistica.ru/files/"


@router.post("/publ_from_hash")
@limiter.limit("666/minute")
async def publ_from_hash(
        request: Request,
        data: RecordHashRequest,
        user_data: dict = Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
):
    try:
        user_id = int(user_data["sub"])
        record_id = decrypt_id(data.hash, user_id)
        if record_id is None:
            logger.warning('Invalid record token')
            raise HTTPException(status_code=400, detail="Invalid record token.")
        data = await publ_by_hash(session, record_id, user_id)
        if data is None:
            logger.warning('Publication not found')
            raise HTTPException(status_code=404, detail="Publication not found.")
        return PublResponse(
            author=data["author"],
            year=data["year"],
            name=data["name"],
            pdf_file=base_url + data["pdf_file"]
        )
    except Exception as e:
        logger.error(f'HTTP Error: {e}', exc_info=True)
        raise HTTPException(status_code=500, detail=f"Server database error: {str(e)}")
