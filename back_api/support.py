from fastapi import APIRouter, Request, HTTPException
from back_api.schemas import SupportRequest
from .rate_limiter import limiter

router = APIRouter()


@router.post("/support")
@limiter.limit("60/minute")
async def suggest_taxon(
        request: Request,
        data: SupportRequest
):
    try:
        print(data.link + "\n\n" + data.user_name + "\n" + data.text)
        return {"message": "OK"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bot error: {str(e)}")
