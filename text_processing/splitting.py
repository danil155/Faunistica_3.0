import logging
import re

from text_processing.data import Data
from text_processing.geodecoder import get_location_info
from text_processing.gbif_parser import find_species_in_text
from config.config_vars import ROMAN_MONTHS

logger = logging.getLogger(__name__)


def dms_to_decimal(degrees: float, minutes: float = 0, seconds: float = 0, direction: str = 'N') -> float:
    decimal = float(degrees) + float(minutes)/60 + float(seconds)/3600
    if direction.upper() in ['S', 'W']:
        decimal = -decimal
    return decimal

def parse_single_coordinate(coord_str: str) -> dict[str, [float, None]]:
    coord_str = (
        coord_str.strip()
        .replace(" ", "")
        .replace(",", ".")
        .replace("′", "'")
        .replace("″", '"')
        .replace("⁰", "°")
    )
    coord_dict = {
        "degrees": None,
        "minutes": None,
        "seconds": None,
        "decimal": None,
    }

    match = re.match(
        r"([-+]?\d{1,3})°(\d{1,2})'(\d{1,2}(?:\.\d+)?)\"([NSWE])",
        coord_str,
        re.IGNORECASE,
    )
    if match:
        degrees, minutes, seconds, direction = match.groups()
        coord_dict.update({
            "degrees": float(degrees),
            "minutes": float(minutes),
            "seconds": float(seconds),
            "decimal": dms_to_decimal(degrees, minutes, seconds, direction),
        })
        return coord_dict

    match = re.match(
        r"([-+]?\d{1,3})°(\d{1,2}(?:\.\d+)?)'([NSWE])",
        coord_str,
        re.IGNORECASE,
    )
    if match:
        degrees, minutes, direction = match.groups()
        coord_dict.update({
            "degrees": float(degrees),
            "minutes": float(minutes),
            "seconds": None,
            "decimal": dms_to_decimal(degrees, minutes, 0, direction),
        })
        return coord_dict

    match = re.match(
        r"([-+]?\d{1,3}(?:\.\d+)?)°?([NSWE])",
        coord_str,
        re.IGNORECASE,
    )
    if match:
        degrees, direction = match.groups()
        coord_dict.update({
            "degrees": float(degrees),
            "minutes": None,
            "seconds": None,
            "decimal": dms_to_decimal(degrees, 0, 0, direction),
        })
        return coord_dict

    return coord_dict


def get_coordinates(text: str) -> list[dict]:
    if not isinstance(text, str):
        logger.warning(f'A parameter with the str type was expected, not {type(text)}')
        return list()

    coords_pattern = r'''
         ([-+]?\d{1,3}[⁰°]\s*\d{1,2}['′]\s*\d{1,2}(?:[.,]\d+)?[\"″]?\s*[NS])|   # DD° MM' SS.SS" N/S
         ([-+]?\d{1,3}[⁰°]\s*\d{1,2}(?:[.,]\d+)?['′]?\s*[NS])|                  # DD° MM.MM' N/S
         ([-+]?\d{1,3}(?:[.,]\d+)?\s*[⁰°]?\s*[NS])|                             # DD.DD N/S or DD.DD° N/S
         ([-+]?\d{1,3}[⁰°]\s*\d{1,2}['′]\s*\d{1,2}(?:[.,]\d+)?[\"″]?\s*[WE])|   # DD° MM' SS.SS" E/W
         ([-+]?\d{1,3}[⁰°]\s*\d{1,2}(?:[.,]\d+)?['′]?\s*[WE])|                  # DD° MM.MM' E/W
         ([-+]?\d{1,3}(?:[.,]\d+)?\s*[⁰°]?\s*[WE])|                             # DD.DD E/W or DD.DD° E/W
     '''

    coords_match = re.findall(coords_pattern, text, re.VERBOSE)
    coordinates = list()

    for match_group in coords_match:
        coord_str = next((x for x in match_group if x), '').strip()
        if not coord_str:
            continue
        try:
            parsed_coord = parse_single_coordinate(coord_str)
            coordinates.append(parsed_coord)
        except (ValueError, IndexError, re.error) as e:
            logger.error(f'Error when searching for coordinates: {e}', exc_info=True)
            raise
            continue

    return coordinates


def get_region(text: str) -> str:
    if not isinstance(text, str):
        logger.warning(f'A parameter with the str type was expected, not {type(text)}')
        return str()

    try:
        region_pattern = r'([А-ЯЁA-Z][а-яёa-z-]+\sобл\.?)'
        region_match = re.search(region_pattern, text)
        return region_match.group(1) if region_match else str()
    except (AttributeError, IndexError, re.error) as e:
        logger.error(f'Error when searching for region: {e}', exc_info=True)
        raise
        return str()


def get_district(text: str) -> str:
    if not isinstance(text, str):
        logger.warning(f'A parameter with the str type was expected, not {type(text)}')
        return str()

    try:
        district_pattern = r'([А-ЯЁA-Z][а-яёa-z-]+\sр-н)'
        district_match = re.search(district_pattern, text)
        return district_match.group(1) if district_match else str()
    except (AttributeError, IndexError, re.error) as e:
        logger.error(f'Error when searching for district: {e}', exc_info=True)
        raise
        return str()


def get_date(text: str) -> str:
    if not isinstance(text, str):
        logger.warning(f'A parameter with the str type was expected, not {type(text)}')
        return str()

    try:
        # template with 6 blocks (DD.MM.YYYY-DD.MM.YYYY)
        pattern_6 = r'\b(\d{1,2})[.-](\d{1,2}|[IVXLCDMivxlcdm]+)[.-](\d{4})[.-](\d{1,2})[.-](\d{1,2}|[IVXLCDMivxlcdm]+)[.-](\d{4})\b'
        match = re.search(pattern_6, text)
        if match:
            blocks = list(match.groups())
            return process_6_blocks(blocks)

        # template with 5 blocks (DD.MM-DD.MM.YYYY)
        pattern_5 = r'\b(\d{1,2})[.-](\d{1,2}|[IVXLCDMivxlcdm]+)[.-](\d{1,2})[.-](\d{1,2}|[IVXLCDMivxlcdm]+)[.-](\d{4})\b'
        match = re.search(pattern_5, text)
        if match:
            blocks = list(match.groups())
            return process_5_blocks(blocks)

        # template with 4 blocks (DD-DD.MM.YYYY)
        pattern_4 = r'\b(\d{1,2})[.-](\d{1,2})[.-](\d{1,2}|[IVXLCDMivxlcdm]+)[.-](\d{4})\b'
        match = re.search(pattern_4, text)
        if match:
            blocks = list(match.groups())
            return process_4_blocks(blocks)

        # template with 3 blocks (DD.MM.YYYY)
        pattern_3 = r'\b(\d{1,2})[.-](\d{1,2}|[IVXLCDMivxlcdm]+)[.-](\d{4})\b'
        match = re.search(pattern_3, text)
        if match:
            blocks = list(match.groups())
            return process_3_blocks(blocks)

        return str()

    except (AttributeError, IndexError, KeyError, ValueError, re.error) as e:
        logger.error(f'Error when searching for date: {e}', exc_info=True)
        return str()

def process_6_blocks(blocks) -> str:
    for i in [1, 4]:
        if blocks[i].isalpha():
            blocks[i] = ROMAN_MONTHS.get(blocks[i].lower(), blocks[i])
        elif blocks[i].isdigit():
            blocks[i] = blocks[i].zfill(2)
    
    if not all(b.isdigit() for b in blocks):
        return str()
    
    start_date = f"{blocks[2]}-{blocks[1]}-{blocks[0].zfill(2)}"
    end_date = f"{blocks[5]}-{blocks[4]}-{blocks[3].zfill(2)}"
    return f"{start_date}:{end_date}"

def process_5_blocks(blocks) -> str:
    for i in [1, 3]:
        if blocks[i].isalpha():
            blocks[i] = ROMAN_MONTHS.get(blocks[i].lower(), blocks[i])
        elif blocks[i].isdigit():
            blocks[i] = blocks[i].zfill(2)
    
    if not all(b.isdigit() for b in blocks):
        return str()
    
    start_date = f"{blocks[4]}-{blocks[1]}-{blocks[0].zfill(2)}"
    end_date = f"{blocks[4]}-{blocks[3]}-{blocks[2].zfill(2)}"
    return f"{start_date}:{end_date}"

def process_4_blocks(blocks) -> str:
    if blocks[2].isalpha():
        blocks[2] = ROMAN_MONTHS.get(blocks[2].lower(), blocks[2])
    elif blocks[2].isdigit():
        blocks[2] = blocks[2].zfill(2)
    
    if not all(b.isdigit() for b in blocks):
        return str()
    
    start_date = f"{blocks[3]}-{blocks[2]}-{blocks[0].zfill(2)}"
    end_date = f"{blocks[3]}-{blocks[2]}-{blocks[1].zfill(2)}"
    return f"{start_date}:{end_date}"

def process_3_blocks(blocks) -> str:
    if blocks[1].isalpha():
        blocks[1] = ROMAN_MONTHS.get(blocks[1].lower(), blocks[1])
    elif blocks[1].isdigit():
        blocks[1] = blocks[1].zfill(2)
    
    if not all(b.isdigit() for b in blocks):
        return str()
    
    return f"{blocks[2]}-{blocks[1]}-{blocks[0].zfill(2)}"


def get_collectors(text: str) -> list:
    if not isinstance(text, str):
        logger.warning(f'A parameter with the str type was expected, not {type(text)}')
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
        logger.error(f'Error when searching for collectors: {e}', exc_info=True)
        raise

    return collectors


def get_numbers_species(text: str) -> dict:
    species_count = {
        'male': 0, 'female': 0,
        'sub_male': 0, 'sub_female': 0,
        'juvenile': 0
    }

    if not isinstance(text, str):
        logger.warning(f'A parameter with the str type was expected, not {type(text)}')
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
                logger.error(f'Error parsing: {e}', exc_info=True)
                raise
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
                logger.error(f'Error parsing: {e}', exc_info=True)
                raise
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
                logger.error(f'Error parsing: {e}', exc_info=True)
                raise
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
                logger.error(f'Error parsing: {e}', exc_info=True)
                raise
                continue
    except re.error as e:
        logger.error(f'Error when searching for numbers species: {e}', exc_info=True)
        raise
    return species_count


def check_full_location_data(data: Data) -> None:
    try:
        if data.coordinate_north.get('decimal') and data.coordinate_east.get('decimal'):
            location_info = get_location_info(data.coordinate_north.get('decimal', 0), data.coordinate_east.get('decimal', 0))
            address = location_info.get('address', {})

            data.country = data.country or address.get('country', "")
            data.region = data.region or address.get('region', "")
            data.district = data.district or address.get('district', "")
            data.gathering_place = data.gathering_place or location_info.get('display_name', "")
    except Exception as e:
        logger.error(f'Error when checking full location data: {e}', exc_info=True)
        raise


def get_separated_parameters(text: str) -> Data:
    data = Data()

    if not isinstance(text, str) or not text.strip():
        logger.warning(f'A parameter with the str type was expected, not {type(text)} or parameter is empty')
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
        logger.critical(f'Critical error in text processing: {e}', exc_info=True)
        raise

    return data


if __name__ == '__main__':
    get_separated_parameters(
        "Gnaphosa steppica Ovtsharenko, Platnick et Song 1992 (pro parte; the specimens from Azerbaijan only): 37. Holotype # (ZMMU), Azerbaijan, Gyandzha (=Kirovobad) Distr., ca 2 km S of Khanlar ( 40°41N, 46°21E ), 8.V.1986, leg. P.M. Dunin.").print()
