from fastapi import APIRouter, HTTPException
from .schemas import InfoRequest, InfoResponse
from text_processing.splitting import get_separated_parameters

router = APIRouter()


def clean_value(value):
    if value in ("", None, [], 0, 0.0):
        return None
    return value


@router.post("/get_info", response_model=InfoResponse)
def get_info(data: InfoRequest):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    info = get_separated_parameters(data.text)
    return InfoResponse(
        country=clean_value(info.country),
        region=clean_value(info.region),
        district=clean_value(info.district),
        gathering_place=clean_value(info.gathering_place),
        coordinate_north=clean_value(info.coordinate_north),
        coordinate_east=clean_value(info.coordinate_east),
        date=clean_value(info.date),
        family=clean_value(info.family),
        genus=clean_value(info.genus),
        species=clean_value(info.species),
        collector=clean_value(info.collector),
        count_males=clean_value(info.count_males),
        count_females=clean_value(info.count_females),
        count_juv_male=clean_value(info.count_sub_males),
        count_juv_female=clean_value(info.count_sub_females)
    )
