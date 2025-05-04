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
    country: Optional[str]
    region: Optional[str]
    district: Optional[str]
    gathering_place: Optional[str]
    coordinate_north: Optional[str]
    coordinate_east: Optional[str]
    date: Optional[str]
    family: Optional[str]
    genus: Optional[str]
    species: Optional[str]
    collector: Optional[List[str]]
    count_males: Optional[int]
    count_females: Optional[int]
    count_juv_male: Optional[int]
    count_juv_female: Optional[int]
    count_juv: Optional[int]


class InsertRecordsRequest(BaseModel):
    begin_date: Optional[str]
    begin_day: Optional[int]
    begin_month: Optional[int]
    begin_year: Optional[int]
    biotope: Optional[str]
    collector: Optional[str]
    country: Optional[str]
    district: Optional[str]
    east: Optional[str]
    end_date: Optional[str]
    end_day: Optional[int]
    end_month: Optional[int]
    end_year: Optional[int]
    family: Optional[str]
    genus: Optional[str]
    is_defined_species: Optional[bool]
    is_in_wsc: Optional[bool]
    is_new_species: Optional[bool]
    matherial_notes: Optional[str]
    measurement_units: Optional[str]
    north: Optional[str]
    place: Optional[str]
    place_notes: Optional[str]
    region: Optional[str]
    selective_gain: Optional[str]
    specimens: Optional[List[int]]
    taxonomic_notes: Optional[str]


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
    filters: Dict[str, Optional[str]]


class SuggestTaxonResponse(BaseModel):
    suggestions: Optional[List[str]]


class PublResponse(BaseModel):
    author = Optional[str]
    year = Optional[str]
    name = Optional[str]
    pdf_file = Optional[str]
