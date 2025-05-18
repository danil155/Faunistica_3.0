from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from back_api.schemas import InsertRecordsRequest
from datetime import datetime, UTC
import re
from typing import Optional
from database.database import get_session
from database.crud import add_record_from_json, get_user
from .rate_limiter import limiter
from .token import get_current_user

router = APIRouter()


def clean_value(value):
    if value in ("", None, [], 0, 0.0):
        return None
    return value


def specimen_parse(specimens):
    if not specimens:
        return None, 0

    entries = []
    num = 0

    def add_entry(count, label, summ):
        if count is not None or count != 0:
            entries.append(f"{count} {label}")
            summ += count

    add_entry(specimens.get("male_adult"), "mmm", num)
    add_entry(specimens.get("female_adult"), "fff", num)
    add_entry(specimens.get("male_juvenile"), "ssm", num)
    add_entry(specimens.get("female_juvenile"), "ssf", num)
    add_entry(specimens.get("undefined_adult"), "adu", num)
    add_entry(specimens.get("undefined_juvenile"), "juv", num)
    if entries:
        res = " | ".join(entries)
        return res, num
    return None, 0


def num_of_specimen(specimens: Optional[dict]) -> Optional[int]:
    if not specimens:
        return 0
    count = 0
    counts = []
    counts[0] = clean_value(specimens.get("male_adult"))
    counts[1] = clean_value(specimens.get("female_adult"))
    counts[2] = clean_value(specimens.get("male_juvenile"))
    counts[3] = clean_value(specimens.get("female_juvenile"))
    counts[4] = clean_value(specimens.get("undefined_adult"))
    counts[5] = clean_value(specimens.get("undefined_juvenile"))
    for i in range(0, 6):
        if counts[i] is not None:
            count += counts[i]
    return count


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
        user_data: dict = Depends(get_current_user),
        session: AsyncSession = Depends(get_session)
):
    north = safe_coord_parse(data.north)
    east = safe_coord_parse(data.east)
    specimen, num = specimen_parse(clean_value(data.specimens))
    user_info = await get_user(session, int(user_data["sub"]))
    record_json = {
        "publ_id": user_info.publ_id,
        "user_id": user_info.id,
        "datetime": datetime.now(UTC),
        "ip": None,
        "errors": None,
        "type": None,
        # "adm_country": clean_value(data.country),
        "adm_region": clean_value(data.region),
        "adm_district": clean_value(data.district),
        "adm_loc": clean_value(data.place),
        "geo_nn": clean_value(north),
        "geo_ee": clean_value(east),
        "geo_nn_raw": clean_value(data.north),
        "geo_ee_raw": clean_value(data.east),
        "geo_origin": clean_value(data.geo_origin),
        "geo_REM": clean_value(data.geo_REM),
        "eve_YY": clean_value(data.begin_year),
        "eve_MM": clean_value(data.begin_month),
        "eve_DD": clean_value(data.begin_day),
        "eve_day_def": True if clean_value(data.begin_day) is not None else False,
        "eve_habitat": clean_value(data.biotope),
        "eve_effort": clean_value(data.selective_gain),
        "abu_coll": clean_value(data.collector),
        "eve_REM": clean_value(data.eve_REM),
        "tax_fam": clean_value(data.family),
        "tax_gen": clean_value(data.genus),
        "tax_sp": clean_value(data.species),
        "tax_sp_def": True if clean_value(data.is_defined_species) is not None else False,
        "tax_nsp": True if clean_value(data.is_new_species) is not None else False,
        "type_status": clean_value(data.type_status),
        "tax_REM": clean_value(data.taxonomic_notes),
        "abu": num,
        "abu_details": specimen,
        "abu_ind_rem": clean_value(data.taxonomic_notes),
        "geo_uncert": clean_value(data.geo_uncert),
        "eve_YY_end": clean_value(data.end_year),
        "eve_MM_end": clean_value(data.end_month),
        "eve_DD_end": clean_value(data.end_day),
        "adm_verbatim": 1
        # adm_verbatim is unknown
    }

    try:
        await add_record_from_json(session, record_json)
        return {"message": "OK"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server database error: {str(e)}")
