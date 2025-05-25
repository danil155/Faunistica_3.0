import asyncio
from typing import List
from fastapi import APIRouter, Request, HTTPException, Depends
from concurrent.futures import ThreadPoolExecutor
import logging

from .schemas import GeoSearchRequest, GeoSearchResponse, GeoLocation
from geodata.GeoFileLoader import GeoFileLoader
from .token import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()
executor = ThreadPoolExecutor()
geo_loader = GeoFileLoader()


async def async_suggestion(data: GeoSearchRequest) -> List[GeoLocation]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, lambda: geo_loader.search(data))


@router.post("/geo_search", response_model=GeoSearchResponse)
async def geo_search(
        request: Request,
        data: GeoSearchRequest,
        user_data: dict = Depends(get_current_user)
):
    try:
        print(data)
        result = await async_suggestion(data)
        print(result)
        return {"suggestions": result}
    except ValueError as e:
        logger.error(f'Value error: {str(e)}', exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f'Internal server error: {str(e)}', exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
