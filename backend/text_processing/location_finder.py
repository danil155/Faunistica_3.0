from pathlib import Path
import json
import re

json_path = Path(__file__).resolve().parent.parent / "locations.json"
_LOCATION_DATA_CACHE = None
_LOOKUP_CACHE = None


# Loads locations from cache or file
def _load_location_data():
    global _LOCATION_DATA_CACHE
    if _LOCATION_DATA_CACHE is not None:
        return _LOCATION_DATA_CACHE

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            _LOCATION_DATA_CACHE = json.load(f)
    except Exception as e:
        _LOCATION_DATA_CACHE = []
    return _LOCATION_DATA_CACHE


# Organizes locations into dictionary
def build_lookup(data):
    lookup = {}
    for country in data:
        key = country.lower()
        lookup[key] = ("country", country, None, None)
        for region in data[country]:
            rkey = region.lower()
            lookup[rkey] = ("region", country, region, None)
            for place in data[country][region]:
                pkey = place.lower()
                lookup[pkey] = ("place", country, region, place)
    return lookup


# Gets locations dictionary from cache or builds a new one if cache is empty
def get_lookup():
    global _LOOKUP_CACHE
    if _LOOKUP_CACHE is not None:
        return _LOOKUP_CACHE

    data = _load_location_data()
    _LOOKUP_CACHE = build_lookup(data)
    return _LOOKUP_CACHE


# Checks text for any matching words with locations
def _extract_entities_sync(text, lookup):
    found = {"country": None, "region": None, "place": None}
    text_lower = text.lower()
    sorted_keys = sorted(lookup.keys(), key=lambda x: -len(x))
    for key in sorted_keys:
        if len(key) < 3:
            continue
        if re.search(r'\b' + re.escape(key) + r'\b', text_lower):
            ent_type, country, region, place = lookup[key]
            if ent_type == "place" and found["place"] is None:
                found["place"] = place
                found["region"] = region
                found["country"] = country
            elif ent_type == "region" and found["region"] is None:
                found["region"] = region
                found["country"] = country
            elif ent_type == "country" and found["country"] is None:
                found["country"] = country
    return found


# Starts the thing, gets lookup and starts the search for locations in text
def extract_entities(text):
    lookup = get_lookup()
    return _extract_entities_sync(text, lookup)
