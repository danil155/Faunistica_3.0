from fastapi import APIRouter, HTTPException, Depends, Request
import pandas as pd
from pathlib import Path
from typing import Optional, Dict, List
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging

from back_api.schemas import SuggestTaxonRequest, SuggestTaxonResponse
from back_api.token import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

csv_path = Path(__file__).resolve().parent.parent / "species_export_20250503.csv"
df = pd.read_csv(csv_path, usecols=["family", "genus", "species"])
executor = ThreadPoolExecutor()


def suggestion(field: str, text: str, filters: Dict[str, Optional[str]]) -> List[str]:
    if field not in ["species", "genus", "family"]:
        logger.warning("Invalid field. Must be 'species', 'genus', or 'family'")
        raise ValueError("Invalid field. Must be 'species', 'genus', or 'family'.")

    query_df = df.copy()

    if filters.get("family"):
        query_df = query_df[query_df["family"].str.contains(filters["family"], case=False, na=False)]

    if filters.get("genus"):
        query_df = query_df[query_df["genus"].str.contains(filters["genus"], case=False, na=False)]

    suggestions = query_df[field]

    filtered = suggestions[
        suggestions.str.contains(text, case=False, na=False)
    ].dropna().drop_duplicates().sort_values()

    return filtered.tolist()


async def async_suggestion(field: str, text: str, filters: Dict[str, Optional[str]]) -> List[str]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, suggestion, field, text, filters)


@router.post("/suggest_taxon", response_model=SuggestTaxonResponse)
async def suggest_taxon(
        request: Request,
        data: SuggestTaxonRequest,
        user_data: dict = Depends(get_current_user)
):
    try:
        suggestions = await async_suggestion(data.field, data.text, data.filters)
        return {"suggestions": suggestions}
    except ValueError as e:
        logger.error(f'Value error: {e}', exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))
