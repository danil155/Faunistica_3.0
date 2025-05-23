import logging
from fastapi import APIRouter, HTTPException, Depends, Request
import pandas as pd
from pathlib import Path
import asyncio
from concurrent.futures import ThreadPoolExecutor

from back_api.token import get_current_user
from back_api.schemas import AutofillTaxonRequest, AutofillTaxonResponse

router = APIRouter()

csv_path = Path(__file__).resolve().parent.parent / "species_export_20250503.csv"
df = pd.read_csv(csv_path, usecols=["family", "genus", "species"])
executor = ThreadPoolExecutor()

logger = logging.getLogger(__name__)


def autofill_taxon(field: str, text: str) -> AutofillTaxonResponse:
    if field not in ["genus", "species"]:
        logger.warning("Invalid field. Must be 'genus' or 'species'.")
        raise ValueError("Invalid field. Must be 'genus' or 'species'.")

    query_df = df.copy()
    match_df = query_df[query_df[field].str.lower() == text.lower()]

    if match_df.empty:
        return AutofillTaxonResponse(family=None, genus=None)

    row = match_df.iloc[0]

    return AutofillTaxonResponse(family=row["family"], genus=row["genus"])


async def async_autofill_taxon(field: str, text: str) -> AutofillTaxonResponse:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, autofill_taxon, field, text)


@router.post("/autofill_taxon", response_model=AutofillTaxonResponse)
async def autofill_taxon_endpoint(
        request: Request,
        data: AutofillTaxonRequest,
        user_data: dict = Depends(get_current_user)
):
    try:
        result = await async_autofill_taxon(data.field, data.text)
        return result
    except ValueError as e:
        logger.error(f'Value error: {e}', exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))
