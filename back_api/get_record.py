from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from database.database import get_session
from database.crud import get_record_by_id
from database.hash import decrypt_id
from .rate_limiter import limiter
from .token import get_current_user
from back_api.schemas import GetRecordRequest, GetRecordResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/get_record", response_model=GetRecordResponse)
@limiter.limit("20/minute")
async def insert_record(
        request: Request,
        data: GetRecordRequest,
        user_data: dict = Depends(get_current_user),
        session: AsyncSession = Depends(get_session)
):
    user_id = int(user_data["sub"])
    record_id = decrypt_id(data.hash, user_id)
    if record_id is None:
        raise HTTPException(status_code=400, detail="Invalid record token.")

    try:
        record_data = await get_record_by_id(session, record_id, user_id)
    except Exception as e:
        logger.error(f'Server database error: {e}', exc_info=True)
        raise HTTPException(status_code=500, detail="Server database error.")

    if not record_data:
        raise HTTPException(status_code=404, detail="Record not found or not owned by user.")

    record_data.hash = data.hash
    return record_data
