from fastapi import APIRouter, HTTPException, Depends, Request
import logging

from .schemas import InfoRequest, InfoResponse
from text_processing.splitting import get_separated_parameters
from .rate_limiter import limiter
from .token import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


def clean_value(value):
    if value in ("", None, [], 0, 0.0):
        return None
    return value


@router.post("/get_info", response_model=InfoResponse)
@limiter.limit("10/minute")
def get_info(
        request: Request,
        data: InfoRequest,
        _user_data: dict = Depends(get_current_user)
):
    if not data.text.strip():
        logger.warning(f' HTTP error: Text cannot be empty')
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    info = get_separated_parameters(data.text)
    coordinate_north = {
        "degrees": info.coordinate_north["degrees"] if info.coordinate_north else None,
        "minutes": info.coordinate_north["minutes"] if info.coordinate_north else None,
        "seconds": info.coordinate_north["seconds"] if info.coordinate_north else None
    }
    coordinate_east = {
        "degrees": info.coordinate_east["degrees"] if info.coordinate_east else None,
        "minutes": info.coordinate_east["minutes"] if info.coordinate_east else None,
        "seconds": info.coordinate_east["seconds"] if info.coordinate_east else None
    }
    return InfoResponse(
        country=clean_value(info.country),
        region=clean_value(info.region),
        district=clean_value(info.district),
        gathering_place=clean_value(info.gathering_place),
        coordinate_north=coordinate_north,
        coordinate_east=coordinate_east,
        date=clean_value(info.date),
        family=clean_value(info.family),
        genus=clean_value(info.genus),
        species=clean_value(info.species),
        collector=clean_value(', '.join(info.collector)),
        count_males=clean_value(info.count_males),
        count_females=clean_value(info.count_females),
        count_juv_male=clean_value(info.count_sub_males),
        count_juv_female=clean_value(info.count_sub_females)
    )
