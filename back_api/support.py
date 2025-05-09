from fastapi import APIRouter, Request, HTTPException

from back_api.schemas import SupportRequest
from .rate_limiter import limiter
from bot.bot_main import bot_instance

router = APIRouter()


@router.post("/support")
@limiter.limit("60/minute")
async def suggest_taxon(
        request: Request,
        data: SupportRequest
):
    try:
        await bot_instance.handlers.send_support_message_from_website(
            username=data.user_name,
            message_text=data.text,
            user_link=data.link
        )
        return {"message": "OK"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bot error: {str(e)}")
