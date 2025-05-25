from typing import List
import pandas as pd
import os
import logging
from functools import lru_cache
from io import StringIO

from back_api.schemas import GeoLocation, GeoSearchRequest

logger = logging.getLogger(__name__)


class GeoFileLoader:
    def __init__(self):
        self.data_dir = 'geodata'

        required_files = ['countryInfo.txt', 'admin1CodesASCII.txt', 'RU.txt']
        for f in required_files:
            if not os.path.exists(os.path.join(self.data_dir, f)):
                raise FileNotFoundError(f"Required file {f} not found in {self.data_dir}")

    @lru_cache(maxsize=1)
    def _load_countries(self) -> pd.DataFrame:
        with open(os.path.join(self.data_dir, 'countryInfo.txt'), 'r', encoding='utf-8') as f:
            lines = [line for line in f if not line.startswith('#')]

        return pd.read_csv(
            StringIO(''.join(lines)),
            sep='\t',
            header=None,
            usecols=[0, 4],
            names=['code', 'name']
        )

    @lru_cache(maxsize=1)
    def _load_regions(self) -> pd.DataFrame:

        return pd.read_csv(
            os.path.join(self.data_dir, 'admin1CodesASCII.txt'),
            sep='\t',
            header=None,
            names=['code', 'name', 'ascii_name', 'geonameid']
        )

    @lru_cache(maxsize=1)
    def _load_russian_locations(self) -> pd.DataFrame:
        cols = [
            'geonameid', 'name', 'asciiname', 'alternatenames',
            'latitude', 'longitude', 'feature_class', 'feature_code',
            'country_code', 'cc2', 'admin1_code', 'admin2_code',
            'admin3_code', 'admin4_code', 'population', 'elevation',
            'dem', 'timezone', 'modification_date'
        ]

        return pd.read_csv(
            os.path.join(self.data_dir, 'RU.txt'),
            sep='\t',
            header=None,
            names=cols,
            encoding='utf-8'
        )

    def _extract_russian_name(self, row) -> str:
        if pd.isna(row['alternatenames']):
            return row['name']
        for name in str(row['alternatenames']).split(','):
            if any(ord(c) > 127 for c in name):
                return name

        return row['name']

    def search(self, request: GeoSearchRequest) -> List[GeoLocation]:
        results = []

        if request.location_type == 'country':
            df = self._load_countries()
            mask = df['name'].str.contains(request.query, case=False, na=False)
            for _, row in df[mask].iterrows():
                print(row)
                results.append(GeoLocation(
                    id=row['code'],
                    name=row['name'],
                    type='country'
                ))
        elif request.location_type == 'region':
            if not request.parent_id:
                raise ValueError("parent_id (country code) required for region search")

            df = self._load_regions()
            print(df)
            mask = df['code'].str.startswith(f"{request.parent_id}.")
            print(mask)
            if request.query:
                print(12121212121212121212)
                mask &= df['name'].str.contains(request.query, case=False, na=False)

            for _, row in df[mask].iterrows():
                results.append(GeoLocation(
                    id=row['code'],
                    name=row['name'],
                    type='region',
                    parent_id=request.parent_id
                ))

        elif request.location_type == 'district':
            if not request.parent_id:
                raise ValueError("parent_id (region code) required for district search")

            df = self._load_russian_locations()
            country_code, region_code = request.parent_id.split('.')
            mask = ((df['country_code'] == country_code) & (df['admin1_code'] == region_code))

            if request.query:
                df['name_ru'] = df.apply(self._extract_russian_name, axis=1)
                mask &= df['name_ru'].str.contains(request.query, case=False, na=False)

            for _, row in df[mask].iterrows():
                results.append(GeoLocation(
                    id=str(row['geonameid']),
                    name=self._extract_russian_name(row),
                    type='district',
                    parent_id=request.parent_id
                ))

        return results
