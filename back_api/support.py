from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from back_api.schemas import SupportRequest
from back_api.messages import send_support_message
from database.database import get_session
from database.crud import get_user_id_by_username
from .rate_limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/support")
@limiter.limit("60/minute")
async def suggest_taxon(
        request: Request,
        data: SupportRequest,
        session: AsyncSession = Depends(get_session)
):
    try:
        user_id = await get_user_id_by_username(session, data.user_name) 
        await send_support_message(data, user_id)
        return {"message": "Support request received"}
    except Exception as e:
        logger.error(f'Failed to process support request: {e}', exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process support request: {str(e)}")
