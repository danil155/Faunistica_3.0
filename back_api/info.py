from fastapi import APIRouter, HTTPException, Depends, Request
from .schemas import InfoRequest, InfoResponse
from text_processing.splitting import get_separated_parameters
from .rate_limiter import limiter
from .token import get_current_user

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
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    info = get_separated_parameters(data.text)
    return InfoResponse(
        country=clean_value(info.country),
        region=clean_value(info.region),
        district=clean_value(info.district),
        gathering_place=clean_value(info.gathering_place),
        coordinate_north={k: info.coordinate_north[k] for k in ("degrees", "minutes", "seconds") if k in info.coordinate_north},
        coordinate_east={k: info.coordinate_east[k] for k in ("degrees", "minutes", "seconds") if k in info.coordinate_east},
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
