from pydantic import BaseModel, Field, constr, field_validator, model_validator, ConfigDict
from typing import Optional, List, Dict


class UserRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    user_name: str


class InfoRequest(BaseModel):
    text: constr(strip_whitespace=True, min_length=1, max_length=1000) = Field(
        ...,
        description="Text must be between 1 and 1,000 characters"
    )
    

class InfoResponse(BaseModel):
    country: Optional[str] = None
    region: Optional[str] = None
    district: Optional[str] = None
    gathering_place: Optional[str] = None
    coordinate_north: Optional[Dict[str, Optional[float]]] = None
    coordinate_east: Optional[Dict[str, Optional[float]]] = None
    date: Optional[str] = None
    family: Optional[str] = None
    genus: Optional[str] = None
    species: Optional[str] = None
    collector: Optional[str] = None
    count_males: Optional[int] = None
    count_females: Optional[int] = None
    count_juv_male: Optional[int] = None
    count_juv_female: Optional[int] = None
    count_juv: Optional[int] = None


class InsertRecordsRequest(BaseModel):
    abu_ind_rem: Optional[str] = None
    adm_verbatim: Optional[bool] = None
    begin_day: Optional[int] = None
    begin_month: Optional[int] = None
    begin_year: int
    biotope: Optional[str] = None
    collector: str
    country: str
    district: Optional[str] = None
    east: Optional[str] = None
    end_day: Optional[int] = None
    end_month: Optional[int] = None
    end_year: Optional[int] = None
    eve_REM: Optional[str] = None
    family: str
    genus: str
    geo_origin: Optional[str] = None
    geo_REM: Optional[str] = None
    geo_uncert: Optional[float] = None
    is_defined_species: Optional[bool] = None
    is_in_wsc: Optional[bool] = None
    is_new_species: Optional[bool] = None
    matherial_notes: Optional[str] = None
    measurement_units: Optional[str] = None
    north: Optional[str] = None
    place: Optional[str] = None
    place_notes: Optional[str] = None
    region: str
    selective_gain: Optional[str] = None
    species: Optional[str] = None
    specimens: Dict[str, Optional[float]]
    taxonomic_notes: Optional[str] = None
    type_status: Optional[str] = None

    model_config = ConfigDict(extra='forbid')

    @model_validator(mode='after')
    def validate_all_fields(self) -> 'InsertRecordsRequest':
        errors = {}

        required_fields = {
            "geo_origin": "Geographical origin is required",
            "country": "Country is required",
            "region": "Region is required",
            "district": "District is required",
            "collector": "Collector is required",
            "measurement_units": "Measurement units are required",
            "family": "Family is required",
            "genus": "Genus is required",
            "specimens": "At least one specimen is required"
        }

        if self.is_defined_species and (not self.species):
            errors["species"] = "Species is required"

        # if self.begin_year and self.begin_year < 1900:
        #     errors["begin_year"] = "Year must be 1900 or later"
        # if self.end_year and self.end_year < 1900 and self.begin_year and self.begin_year > self.end_year:
        #     errors["end_year"] = "Year must be between 1900 year and current year; End year shouldn't exceed the beginning year"
        # elif self.end_year and self.end_year < 1900:
        #     errors["end_year"] = "Year must be between 1900 year and current year"
        # elif self.end_year and self.begin_year and self.begin_year > self.end_year:
        #     errors["end_year"] = "End year shouldn't exceed the beginning year"

        for field, message in required_fields.items():
            value = getattr(self, field)
            if value is None or (isinstance(value, (str, dict)) and not value):
                errors[field] = message

        if self.specimens and not any(count for count in self.specimens.values() if count):
            errors["specimens"] = "At least one specimen must be recorded"

        if errors:
            raise ValueError(errors)

        return self

    @field_validator('north', 'east')
    def validate_coordinates(cls, v: Optional[str]) -> Optional[str]:
        if v and not any(char in v for char in ['°', "'", '"']):
            raise ValueError("Invalid coordinate format")
        return v

    @field_validator('geo_origin')
    def validate_geo_origin(cls, v: Optional[str]) -> Optional[str]:
        if v and v not in ["original", "volunteer", "nothing"]:
            raise ValueError("Invalid geo_origin value")
        return v


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


class GeoSearchRequest(BaseModel):
    field: str
    text: str
    filters: Optional[Dict[str, Optional[str]]] = None


class GeoSearchResponse(BaseModel):
    suggestions: Optional[List[str]] = None


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


class GetLocationRequest(BaseModel):
    degrees_n: float
    minutes_n: Optional[float] = None
    seconds_n: Optional[float] = None
    degrees_e: float
    minutes_e: Optional[float] = None
    seconds_e: Optional[float] = None


class GetLocationResponse(BaseModel):
    country: Optional[str] = None
    region: Optional[str] = None
    district: Optional[str] = None


class RemoveRecordRequest(BaseModel):
    hash: str


class GetRecordRequest(BaseModel):
    hash: str


class GetRecordResponse(BaseModel):
    hash: str
    type: Optional[str] = None
    adm_country: Optional[str] = None
    adm_region: Optional[str] = None
    adm_district: Optional[str] = None
    adm_loc: Optional[str] = None
    geo_nn_raw: Optional[str] = None
    geo_ee_raw: Optional[str] = None
    geo_origin: Optional[str] = None
    geo_REM: Optional[str] = None
    eve_YY: Optional[int] = None
    eve_MM: Optional[int] = None
    eve_DD: Optional[int] = None
    eve_day_def: Optional[bool] = None
    eve_habitat: Optional[str] = None
    eve_effort: Optional[str] = None
    abu_coll: Optional[str] = None
    eve_REM: Optional[str] = None
    tax_fam: Optional[str] = None
    tax_gen: Optional[str] = None
    tax_sp: Optional[str] = None
    tax_sp_def: Optional[bool] = None
    tax_nsp: Optional[bool] = None
    type_status: Optional[str] = None
    tax_REM: Optional[str] = None
    abu: Optional[float] = None
    abu_details: Optional[str] = None
    abu_ind_rem: Optional[str] = None
    geo_uncert: Optional[float] = None
    eve_YY_end: Optional[int] = None
    eve_MM_end: Optional[int] = None
    eve_DD_end: Optional[int] = None


class EditRecordRequest(BaseModel):
    hash: str
    type: Optional[str] = None
    adm_country: str
    adm_region: str
    adm_district: Optional[str] = None
    adm_loc: Optional[str] = None
    geo_nn_raw: Optional[str] = None
    geo_ee_raw: Optional[str] = None
    geo_origin: Optional[str] = None
    geo_REM: Optional[str] = None
    eve_YY: int
    eve_MM: Optional[int] = None
    eve_DD: Optional[int] = None
    eve_day_def: Optional[bool] = None
    eve_habitat: Optional[str] = None
    eve_effort: Optional[str] = None
    abu_coll: str
    eve_REM: Optional[str] = None
    tax_fam: str
    tax_gen: str
    tax_sp: Optional[str] = None
    tax_sp_def: Optional[bool] = None
    tax_nsp: Optional[bool] = None
    type_status: Optional[str] = None
    tax_REM: Optional[str] = None
    abu: float
    abu_details: str
    abu_ind_rem: Optional[str] = None
    geo_uncert: Optional[float] = None
    eve_YY_end: Optional[int] = None
    eve_MM_end: Optional[int] = None
    eve_DD_end: Optional[int] = None


class RecordHashRequest(BaseModel):
    hash: str
