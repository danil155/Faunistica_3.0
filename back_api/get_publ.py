from fastapi import APIRouter, HTTPException, Depends, Request
from back_api.schemas import PublResponse
from database.database import get_session
from database.crud import username_and_publication
from .rate_limiter import limiter
from .token import get_current_user

router = APIRouter()
base_url = "https://faunistica.ru/files"


@router.get("/get_publ")
@limiter.limit("666/minute")
async def insert_record(
        request: Request,
        user_data: dict = Depends(get_current_user)
):
    async with get_session() as session:
        try:
            data = await username_and_publication(session, user_data["sub"])

            return PublResponse(
                author=data["publication"]["author"],
                year=data["publication"]["year"],
                name=data["publication"]["name"],
                pdf_file=base_url + data["publication"]["pdf_file"]
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Server database error: {str(e)}")
