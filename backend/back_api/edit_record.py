from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, UTC
import logging

from database.database import get_session
from database.crud import edit_record_by_id
from database.hash import decrypt_id
from .rate_limiter import limiter
from .token import get_current_user
from back_api.schemas import EditRecordRequest

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/edit_record")
@limiter.limit("20/minute")
async def edit_record(
        request: Request,
        data: EditRecordRequest,
        user_data: dict = Depends(get_current_user),
        session: AsyncSession = Depends(get_session)
):
    user_id = int(user_data["sub"])
    record_id = decrypt_id(data.hash, user_id)
    if record_id is None:
        logger.warning('Invalid record token')
        raise HTTPException(status_code=400, detail="Invalid record token.")

    try:
        data = data.model_dump()
        data["datetime"] = datetime.now(UTC).replace(tzinfo=None, microsecond=0)
        data["type"] = "rec_ok"
        is_success = await edit_record_by_id(session, record_id, user_id, data)
    except Exception as e:
        logger.error(f'Server database error: {e}', exc_info=True)
        raise HTTPException(status_code=500, detail="Server database error.")

    if is_success:
        return {"message": "OK"}
    else:
        logger.warning('Record not found or not owned by user')
        raise HTTPException(status_code=404, detail="Record not found or not owned by user.")
