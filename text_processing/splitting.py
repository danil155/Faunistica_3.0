import logging
import re

from text_processing.data import Data
from text_processing.geodecoder import get_location_info
from text_processing.gbif_parser import find_species_in_text

logger = logging.getLogger(__name__)


def get_coordinates(text: str) -> list:
    if not isinstance(text, str):
        logger.warning(f' A parameter with the str type was expected, not {type(text)}')
        return list()

    coords_pattern = r'''
         ([-+]?\d{1,3}[°]\s*\d{1,2}['′]\s*\d{1,2}(?:\.\d+)?["″]?\s*[NS])|  # DD° MM' SS.SS" N/S
         ([-+]?\d{1,3}[°]\s*\d{1,2}(?:\.\d+)?['′]?\s*[NS])|                # DD° MM.MM' N/S
         ([-+]?\d{1,3}(?:\.\d+)?\s*[NS])|                                  # DD.DD N/S
         ([-+]?\d{1,3}[°]\s*\d{1,2}['′]\s*\d{1,2}(?:\.\d+)?["″]?\s*[WE])|  # DD° MM' SS.SS" E/W
         ([-+]?\d{1,3}[°]\s*\d{1,2}(?:\.\d+)?['′]?\s*[WE])|                # DD° MM.MM' E/W
         ([-+]?\d{1,3}(?:\.\d+)?\s*[WE])                                   # DD.DD E/W
     '''

    coords_match = re.findall(coords_pattern, text, re.VERBOSE)
    coordinates = list()

    for match_group in coords_match:
        coord_str = next((x for x in match_group if x), '').strip()
        if not coord_str:
            continue
        try:
            direction = coord_str[-1].upper()
            value_str = coord_str[:-1].strip()
            if '°' in value_str:
                parts = re.split(r'[°\'"″′]', value_str)
                degrees = float(parts[0].strip())
                minutes = float(parts[1].strip()) if len(parts) > 1 and parts[1].strip() else 0
                seconds = float(parts[2].strip()) if len(parts) > 2 and parts[2].strip() else 0
                decimal_coord = degrees + (minutes / 60) + (seconds / 3600)
            else:
                decimal_coord = float(value_str.replace(',', '.').strip())
            if direction in ['S', 'W']:
                decimal_coord = -abs(decimal_coord)
            coordinates.append(decimal_coord)
        except (ValueError, IndexError, re.error) as e:
            logger.warning(f' Error when searching for coordinates: {e}')
            continue

    return coordinates


def get_region(text: str) -> str:
    if not isinstance(text, str):
        logger.warning(f' A parameter with the str type was expected, not {type(text)}')
        return str()

    try:
        region_pattern = r'([А-ЯЁA-Z][а-яёa-z-]+\sобл\.?)'
        region_match = re.search(region_pattern, text)
        return region_match.group(1) if region_match else str()
    except (AttributeError, IndexError, re.error) as e:
        logger.warning(f' Error when searching for region: {e}')
        return str()


def get_district(text: str) -> str:
    if not isinstance(text, str):
        logger.warning(f' A parameter with the str type was expected, not {type(text)}')
        return str()

    try:
        district_pattern = r'([А-ЯЁA-Z][а-яёa-z-]+\sр-н)'
        district_match = re.search(district_pattern, text)
        return district_match.group(1) if district_match else str()
    except (AttributeError, IndexError, re.error) as e:
        logger.warning(f' Error when searching for district: {e}')
        return str()


def get_date(text: str) -> str:
    if not isinstance(text, str):
        logger.warning(f' A parameter with the str type was expected, not {type(text)}')
        return str()

    try:
        date_pattern = r'(\d{1,2}[.-][IVXLCDM\d]+[.-]\d{4})'
        date_match = re.search(date_pattern, text)
        if date_match:
            roman_months = {"I": "01", "II": "02", "III": "03", "IV": "04", "V": "05", "VI": "06",
                            "VII": "07", "VIII": "08", "IX": "09", "X": "10", "XI": "11", "XII": "12"}

            if date_match.group(0).find('.') != -1:
                date_current = date_match.group(0).split('.')
            else:
                date_current = date_match.group(0).split('-')

            if date_current[1].isalpha():
                date_current[1] = roman_months[date_current[1]]

            try:
                day_int = int(date_current[0])
                year_int = int(date_current[2])
                if not (1 <= day_int <= 31) or not (1000 <= year_int <= 9999):
                    return str()
            except ValueError as e:
                logger.warning(f' Date error: {e}')
                return str()

            date_current[0], date_current[2] = date_current[2], date_current[0]
            date_current = '-'.join(date_current)
            return date_current
        return str()
    except (AttributeError, IndexError, KeyError, ValueError, re.error) as e:
        logger.warning(f' Error when searching for date: {e}')
        return str()


def get_collectors(text: str) -> list:
    if not isinstance(text, str):
        logger.warning(f' A parameter with the str type was expected, not {type(text)}')
        return list()

    # Pattern: Нестеров А. А.
    collector_two_initials_pattern = r'\b[A-ZА-ЯЁ][a-zа-яё]+(?:\s[A-ZА-ЯЁ]\.)+(?:\s?[A-ZА-ЯЁ]\.)'
    collector_two_initials_match = re.findall(collector_two_initials_pattern, text)

    # Pattern: Нестеров А.
    collector_pattern = r'\b[A-ZА-ЯЁ][a-zа-яё]+(?:\s[A-ZА-ЯЁ]\.)'
    collector_match = re.findall(collector_pattern, text)

    # Pattern: А. Нестеров или А. А. Нестеров
    reverse_collector_pattern = r'\b(?:\s?[A-ZА-ЯЁ]\.)+\s[A-ZА-ЯЁ][a-zа-яё]+'
    reverse_collector_match = re.findall(reverse_collector_pattern, text)

    collectors = list()

    try:
        if collector_two_initials_match:
            collectors += collector_two_initials_match
        if collector_match:
            for collector in collector_match:
                if collector not in ' '.join(collectors):
                    collectors += [collector]
        if reverse_collector_match:
            for collector in reverse_collector_match:
                if collector not in ' '.join(collectors):
                    collectors += [collector]
    except (AttributeError, TypeError) as e:
        logger.warning(f' Error when searching for collectors: {e}')

    return collectors


def get_numbers_species(text: str) -> dict:
    species_count = {
        'male': 0, 'female': 0,
        'sub_male': 0, 'sub_female': 0,
        'juvenile': 0
    }

    if not isinstance(text, str):
        logger.warning(f' A parameter with the str type was expected, not {type(text)}')
        return species_count

    # Patterns
    adult_pattern = r'(\d+)\s+(?<![♀♂])([♂♀]|male|female|m|f|M|F|самец|самка)(?![♀♂])'
    subadult_pattern = r'(\d+)\s+(sub♀|sub♂|submale|subfemale|subm|subf|subM|subF|sM|sF|субсамец|субсамка)'
    juvenile_pattern = r'(\d+)\s+(?:juv|juvenile|j|ювенил)'
    double_sign_pattern = r'(\d+)?\s*([♀♂]{2,})'

    try:
        # Adults
        for count, gender in re.findall(adult_pattern, text):
            try:
                count = int(count)
                if gender in ["♂", "male", "m", "M", "самец"]:
                    species_count['male'] += count
                elif gender in ["♀", "female", "f", "F", "самка"]:
                    species_count['female'] += count
            except (IndexError, ValueError) as e:
                logger.warning(f' Error parsing: {e}')
                continue

        # Subadults
        for count, gender in re.findall(subadult_pattern, text):
            try:
                count = int(count)
                if gender in ["sub♂", "submale", "subm", "subM", "sM", "субсамец"]:
                    species_count['sub_male'] += count
                elif gender in ["sub♀", "subfemale", "subf", "subF", "sF", "субсамка"]:
                    species_count['sub_female'] += count
            except (IndexError, ValueError) as e:
                logger.warning(f' Error parsing: {e}')
                continue

        # Juveniles
        for match in re.findall(juvenile_pattern, text):
            try:
                if isinstance(match, tuple):
                    count = int(match[0])
                else:
                    count = int(match)
                count = int(match[0])
                species_count['juvenile'] += count
            except (IndexError, ValueError, TypeError) as e:
                logger.warning(f' Error parsing: {e}')
                continue

        # Multiple adults
        for match in re.findall(double_sign_pattern, text):
            try:
                count = int(match[0]) if match[0] else 1
                if "♀" in match[1]:
                    species_count['female'] += count
                elif "♂" in match[1]:
                    species_count['male'] += count
            except (IndexError, ValueError) as e:
                logger.warning(f' Error parsing: {e}')
                continue
    except re.error as e:
        logger.warning(f' Error when searching for numbers species: {e}')
    return species_count


def check_full_location_data(data: Data) -> None:
    try:
        if data.coordinate_north and data.coordinate_east:
            location_info = get_location_info(data.coordinate_north, data.coordinate_east)
            address = location_info.get('address', {})

            data.country = data.country or address.get('country', "")
            data.region = data.region or address.get('region', "")
            data.district = data.district or address.get('district', "")
            data.gathering_place = data.gathering_place or location_info.get('display_name', "")
    except Exception as e:
        logger.warning(f' Error when checking full location data: {e}')


def get_separated_parameters(text: str) -> Data:
    data = Data()

    if not isinstance(text, str) or not text.strip():
        logger.warning(f' A parameter with the str type was expected, not {type(text)} or parameter is empty')
        return data

    try:
        coords = get_coordinates(text)
        if coords and len(coords) >= 2:
            data.coordinate_north, data.coordinate_east = coords

        data.region = get_region(text)
        data.district = get_district(text)
        data.date = get_date(text)
        data.collector = get_collectors(text)

        species = get_numbers_species(text)
        data.count_males = species.get('male', 0)
        data.count_females = species.get('female', 0)
        data.count_sub_males = species.get('sub_male', 0)
        data.count_sub_females = species.get('sub_female', 0)
        data.count_juveniles = species.get('juvenile', 0)

        found_name, taxon_data = find_species_in_text(text)
        if found_name:
            data.family = taxon_data.get('семейство', '')
            data.genus = taxon_data.get('род', '')
            data.species = taxon_data.get('вид', '')

        check_full_location_data(data)
    except Exception as e:
        logger.critical(f' Critical error in text processing: {e}')

    return data
