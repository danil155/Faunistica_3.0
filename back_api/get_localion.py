from fastapi import APIRouter, Depends, Request, HTTPException
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
import logging

from back_api.schemas import GetLocationResponse, GetLocationRequest
from .token import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


def get_location_names(lat, lon):
    geolocator = Nominatim(user_agent="geoapi", timeout=10)

    try:
        location = geolocator.reverse((lat, lon), language='ru')

        if location is None:
            raise HTTPException(status_code=404, detail="Location not found for the given coordinates")

        address = location.raw.get('address', {})

        country = address.get('country', None)
        region = address.get('state', address.get('region', None))
        district = address.get('county', address.get('district', None))

        return {
            "country": country,
            "region": region,
            "district": district
        }
    except GeocoderTimedOut as e:
        logger.error(f' GeocoderTimedOut: {e}', exc_info=True)
        raise HTTPException(status_code=408, detail="Geocoding service timeout")
    except Exception as e:
        logger.error(f' HTTP Error: {e}', exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


def dms_to_dd(
    degrees: float,
    minutes: float | None = None,
    seconds: float | None = None,
) -> float:
    minutes = minutes if minutes is not None else 0
    seconds = seconds if seconds is not None else 0
    dd = degrees + (minutes / 60) + (seconds / 3600)
    return dd


@router.post("/get_loc", response_model=GetLocationResponse)
async def get_loc(
        request: Request,
        data: GetLocationRequest,
        user_data: dict = Depends(get_current_user)
):
    latitude = dms_to_dd(data.degrees_n, data.minutes_n, data.seconds_n)
    longitude = dms_to_dd(data.degrees_e, data.minutes_e, data.seconds_e)
    location = get_location_names(latitude, longitude)
    return GetLocationResponse(
        country=location.get("country"),
        region=location.get("region"),
        district=location.get("district")
    )
