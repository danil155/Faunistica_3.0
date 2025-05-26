from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from database.database import get_session
from database.crud import get_user, is_publ_filled, update_user
from .rate_limiter import limiter
from .token import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/next_publ")
@limiter.limit("10/minute")
async def next_publ(
        request: Request,
        user_data: dict = Depends(get_current_user),
        session: AsyncSession = Depends(get_session)
):
    user_id = int(user_data["sub"])
    user_info = await get_user(session, user_id)
    print(user_info)

    if not await is_publ_filled(session, user_id, user_info.publ_id):
        logger.warning('Publication is not filled')
        raise HTTPException(status_code=409, detail="Publication is not filled")

    if not user_info.items:
        print(user_info.items)
        logger.warning('No publications available')
        raise HTTPException(status_code=404, detail="No publications available")

    items = user_info.items.split("|")
    num_publ = items.index(str(user_info.publ_id)) if str(user_info.publ_id) in items else -1

    if (num_publ != -1) and (num_publ != len(items) - 1):
        publ_id = int(items[num_publ + 1])
        await update_user(session=session, user_id=user_id, publ_id=publ_id)
        return True
    return False
