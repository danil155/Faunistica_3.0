from pydantic import BaseModel
from typing import Optional, List, Dict


class UserRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    user_name: str


class InfoRequest(BaseModel):
    text: str
    

class InfoResponse(BaseModel):
    country: Optional[str] = None
    region: Optional[str] = None
    district: Optional[str] = None
    gathering_place: Optional[str] = None
    coordinate_north: Optional[str] = None
    coordinate_east: Optional[str] = None
    date: Optional[str] = None
    family: Optional[str] = None
    genus: Optional[str] = None
    species: Optional[str] = None
    collector: Optional[List[str]] = None
    count_males: Optional[int] = None
    count_females: Optional[int] = None
    count_juv_male: Optional[int] = None
    count_juv_female: Optional[int] = None
    count_juv: Optional[int] = None


class InsertRecordsRequest(BaseModel):
    adm_verbatim: Optional[bool] = None
    begin_date: Optional[str] = None
    begin_day: Optional[int] = None
    begin_month: Optional[int] = None
    begin_year: Optional[int] = None
    biotope: Optional[str] = None
    collector: Optional[str] = None
    country: Optional[str] = None
    district: Optional[str] = None
    east: Optional[str] = None
    end_date: Optional[str] = None
    end_day: Optional[int] = None
    end_month: Optional[int] = None
    end_year: Optional[int] = None
    family: Optional[str] = None
    genus: Optional[str] = None
    geo_origin: Optional[str] = None
    is_defined_species: Optional[bool] = None
    is_in_wsc: Optional[bool] = None
    is_new_species: Optional[bool] = None
    matherial_notes: Optional[str] = None
    measurement_units: Optional[str] = None
    north: Optional[str] = None
    place: Optional[str] = None
    place_notes: Optional[str] = None
    region: Optional[str] = None
    selective_gain: Optional[str] = None
    species: Optional[str] = None
    specimens: Optional[Dict[str, Optional[int]]] = None
    taxonomic_notes: Optional[str] = None


class SpeciesStats(BaseModel):
    species: str
    count: int


class LatestRecord(BaseModel):
    datetime: str
    species: str
    location: str
    username: str


class StatisticsResponse(BaseModel):
    total_publications: int
    processed_publications: int
    total_species: int
    unique_species: int
    top_species: List[SpeciesStats]
    latest_records: List[LatestRecord]


class SuggestTaxonRequest(BaseModel):
    field: str
    text: str
    filters: Optional[Dict[str, Optional[str]]] = None


class SuggestTaxonResponse(BaseModel):
    suggestions: Optional[List[str]] = None


class PublResponse(BaseModel):
    author: Optional[str] = None
    year: Optional[str] = None
    name: Optional[str] = None
    pdf_file: Optional[str] = None


class AutofillTaxonRequest(BaseModel):
    field: str
    text: str


class AutofillTaxonResponse(BaseModel):
    family: Optional[str] = None
    genus: Optional[str] = None


class SupportRequest(BaseModel):
    link: str
    user_name: Optional[str] = None
    text: str
    issue_type: str
    
