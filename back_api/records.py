from fastapi import APIRouter, HTTPException, Depends, Request
from back_api.schemas import InsertRecordsRequest
from datetime import datetime, UTC
import re
from typing import Optional
from database.database import get_session
from database.crud import add_record_from_json, get_user
from .rate_limiter import limiter
from .token import get_current_user

router = APIRouter()


def parse_coordinate(coord: str) -> float:
    coord = coord.strip()

    # 1. Simple float number
    if re.match(r'^-?\d+(\.\d+)?$', coord):
        return round(float(coord), 6)

    # 2. Degree + minutes: 59°29'
    match_deg_min = re.match(r'^(\d{1,3})°\s*(\d{1,2})\'$', coord)
    if match_deg_min:
        degrees = int(match_deg_min.group(1))
        minutes = int(match_deg_min.group(2))
        decimal = degrees + minutes / 60
        return round(decimal, 6)

    # 3. Degree + minutes + seconds: 56°51'10"
    match_deg_min_sec = re.match(r'^(\d{1,3})°\s*(\d{1,2})\'\s*(\d{1,2})(?:["″])$', coord)
    if match_deg_min_sec:
        degrees = int(match_deg_min_sec.group(1))
        minutes = int(match_deg_min_sec.group(2))
        seconds = int(match_deg_min_sec.group(3))
        decimal = degrees + (minutes / 60) + (seconds / 3600)
        return round(decimal, 6)

    raise ValueError(f"Invalid coordinate format: {coord}")


def safe_coord_parse(coord: Optional[str]) -> Optional[float]:
    if not coord:
        return None
    try:
        return parse_coordinate(coord)
    except ValueError:
        return None


@router.post("/insert_record")
@limiter.limit("5/minute")
async def insert_record(
        request: Request,
        data: InsertRecordsRequest,
        user_data: dict = Depends(get_current_user)
):
    async with get_session() as session:
        north = safe_coord_parse(data.north)
        east = safe_coord_parse(data.east)
        user_info = await get_user(session, user_data["sub"])
        record_json = {
            "publ_id": user_info.publ_id,
            "user_id": user_info.id,
            "datetime": datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S'),
            "ip": "WARNING",
            "errors": "WARNING",
            "type": "WARNING",
            "adm_country": data.country,
            "adm_region": data.region,
            "adm_district": data.district,
            "adm_loc": data.place,
            "geo_nn": north,
            "geo_ee": east,
            "geo_nn_raw": data.north,
            "geo_ee_raw": data.east,
            "geo_origin": "WARNING",
            "geo_REM": "WARNING",
            "eve_YY": data.begin_year,
            "eve_MM": data.begin_month,
            "eve_DD": data.begin_day,
            "eve_day_def": "WARNING",
            "eve_habitat": "WARNING",
            "eve_effort": "WARNING",
            "abu_coll": "WARNING",
            "eve_REM": "WARNING",
            "tax_fam": data.family,
            "tax_gen": data.genus,
            "tax_sp": data.species,
            "tax_sp_def": "WARNING",
            "tax_nsp": "WARNING",
            "type_status": "WARNING",
            "tax_REM": data.taxonomic_notes,
            "abu": "WARNING",
            "abu_details": "WARNING",
            "abu_ind_rem": "WARNING",
            "geo_uncert": "WARNING",
            "eve_YY_end": data.end_year,
            "eve_MM_end": data.end_month,
            "eve_DD_end": data.end_day,
            "adm_verbatim": "WARNING"
        }

        try:
            await add_record_from_json(session, record_json)
            return {"message": "OK"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Server database error: {str(e)}")
