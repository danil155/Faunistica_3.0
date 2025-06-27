from fastapi import APIRouter, Request, HTTPException, Depends
from pathlib import Path
import json
import logging
from typing import List, Dict, Optional

from .token import get_current_user
from .schemas import GeoSearchRequest, GeoSearchResponse

logger = logging.getLogger(__name__)
router = APIRouter()
json_path = Path(__file__).resolve().parent.parent / "locations.json"
_LOCATION_DATA = None


def _load_location_data():
    global _LOCATION_DATA
    if _LOCATION_DATA is None:
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                _LOCATION_DATA = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load location data: {e}", exc_info=True)
            _LOCATION_DATA = []
    return _LOCATION_DATA


async def get_suggestions(field: str, text: str, filters: Optional[Dict] = None) -> List[str]:
    location_data = _load_location_data()
    if not location_data:
        return []
    text = text.lower().strip()
    filters = filters or {}
    
    if field == "country":
        return [
            country for country in location_data.keys()
            if text in country.lower()
        ][:10]

    elif field == "region":
        country_filter = filters.get("country")
        regions = []

        for country, region_list in location_data.items():
            if country_filter and country != country_filter:
                continue

            regions.extend([
                region for region in region_list.keys()
                if text in region.lower()
            ])

        return regions[:50]

    elif field == "district":
        country_filter = filters.get("country")
        region_filter = filters.get("region")
        districts = []

        for country, regions in location_data.items():
            if country_filter and country != country_filter:
                continue

            for region, district_list in regions.items():
                if region_filter and region != region_filter:
                    continue

                districts.extend([
                    district for district in district_list
                    if text in district.lower()
                ])

        return districts[:50]

    return []


@router.post("/geo_search", response_model=GeoSearchResponse)
async def geo_search(
        request: Request,
        data: GeoSearchRequest,
        user_data: dict = Depends(get_current_user)
):
    try:
        suggestions = await get_suggestions(data.field, data.text, data.filters)
        return {"suggestions": suggestions or None}
    except Exception as e:
        logger.error(f"Geo search failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
