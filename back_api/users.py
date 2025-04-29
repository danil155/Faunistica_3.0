from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .schemas import UserRequest, UserResponse, Publication
from database.crud import get_user_id_by_password, username_and_publication
from database.database import get_session

router = APIRouter()


@router.post("/get_user", response_model=UserResponse)
async def handle_user_data(
        data: UserRequest,
        session: AsyncSession = Depends(get_session)
):
    user_id = await get_user_id_by_password(session, data.password)
    if user_id == -1:
        raise HTTPException(status_code=401, detail="No such user for this password")

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
