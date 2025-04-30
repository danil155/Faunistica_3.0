from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from .schemas import UserRequest, UserResponse, Publication
from database.crud import get_user_id_by_username, is_pass_correct, username_and_publication
from database.database import get_session
from .rate_limiter import limiter

router = APIRouter()


@router.post("/get_user", response_model=UserResponse)
@limiter.limit("15/minute")
async def handle_user_data(
        request: Request,
        data: UserRequest,
        session: AsyncSession = Depends(get_session)
):
    user_id = await get_user_id_by_username(session, data.username)
    if user_id == -1:
        raise HTTPException(status_code=404, detail="User not found for this username")

    if not await is_pass_correct(session, user_id, data.password):
        raise HTTPException(status_code=401, detail="Wrong password")

    user_data = await username_and_publication(session, user_id)

    if user_data["publication"]:
        publ = Publication(
            author=user_data["publication"]["author"],
            year=user_data["publication"]["year"],
            name=user_data["publication"]["name"],
            pdf_file=user_data["publication"]["pdf_file"]
        )
    else:
        publ = Publication()

    return UserResponse(
        user_name=user_data["user_name"],
        publication=publ
    )
