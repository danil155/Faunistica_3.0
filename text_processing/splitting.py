import re
import sys

from text_processing.data import Data
from text_processing.geodecoder import get_location_info
from text_processing.gbif_parser import find_species_in_text

def get_coordinates(text: str) -> list:
    coords_pattern = r'(\d{1,3}[.,]\d+|\d{1,3})\s*[⁰°]?\s*([NS])[,;]?\s*(\d{1,3}[.,]\d+|\d{1,3})\s*[⁰°]?\s*([EW])'
    coords_match = re.search(coords_pattern, text)
    if coords_match:
        coords = coords_match.group(0)
        coords_split_match = [float(coord.replace(',', '.')) for coord in re.findall(r'[-+]?\d+[.,]\d+', coords)]
        return coords_split_match

    return []


def get_region(text: str) -> str:
    region_pattern = r'([А-ЯЁA-Z][а-яёa-z-]+\sобл\.?)'
    region_match = re.search(region_pattern, text)
    if region_match:
        return region_match.group(1)

    return ''


def get_district(text: str) -> str:
    district_pattern = r'([А-ЯЁA-Z][а-яёa-z-]+\sр-н)'
    district_match = re.search(district_pattern, text)
    if district_match:
        return district_match.group(1)

    return ''


def get_date(text: str) -> str:
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
        date_current[0], date_current[2] = date_current[2], date_current[0]
        date_current = '-'.join(date_current)
        return date_current

    return ''


def get_collectors(text: str) -> list:
    # Шаблон: Нестеров А. А.
    collector_two_initials_pattern = r'\b[A-ZА-ЯЁ][a-zа-яё]+(?:\s[A-ZА-ЯЁ]\.)+(?:\s?[A-ZА-ЯЁ]\.)'
    collector_two_initials_match = re.findall(collector_two_initials_pattern, text)

    # Шаблон: Нестеров А.
    collector_pattern = r'\b[A-ZА-ЯЁ][a-zа-яё]+(?:\s[A-ZА-ЯЁ]\.)'
    collector_match = re.findall(collector_pattern, text)

    # Шаблон: А. Нестеров или А. А. Нестеров
    reverse_collector_pattern = r'\b(?:\s?[A-ZА-ЯЁ]\.)+\s[A-ZА-ЯЁ][a-zа-яё]+'
    reverse_collector_match = re.findall(reverse_collector_pattern, text)

    collectors = list()
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

    return collectors


def get_numbers_species(text: str):
    # Patterns
    adult_pattern = r'(\d+)\s+(?<![♀♂])([♂♀]|male|female|m|f|M|F|самец|самка)(?![♀♂])'
    subadult_pattern = r'(\d+)\s+(sub♀|sub♂|submale|subfemale|subm|subf|subM|subF|sM|sF|субсамец|субсамка)'
    juvenile_pattern = r'(\d+)\s+(?:juv|juvenile|j|ювенил)'
    double_sign_pattern = r'(\d+)?\s*([♀♂]{2,})'

    species_count = {
        'male': 0, 'female': 0,
        'sub_male': 0, 'sub_female': 0,
        'juvenile': 0
    }
    double_female_count = 0
    double_male_count = 0

    # Adults
    for count, gender in re.findall(adult_pattern, text):
        count = int(count)
        if gender in ["♂", "male", "m", "M", "самец"]:
            species_count['male'] += count
        elif gender in ["♀", "female", "f", "F", "самка"]:
            species_count['female'] += count

    # Subadults
    for count, gender in re.findall(subadult_pattern, text):
        count = int(count)
        if gender in ["sub♂", "submale", "subm", "subM", "sM", "субсамец"]:
            species_count['sub_male'] += count
        elif gender in ["sub♀", "subfemale", "subf", "subF", "sF", "субсамка"]:
            species_count['sub_female'] += count

    # Juveniles
    for match in re.findall(juvenile_pattern, text):
        count = int(match[0])
        species_count['juvenile'] += count

    # Something weird
    for match in re.findall(double_sign_pattern, text):
        count = int(match[0]) if match[0] else 1
        if "♀" in match[1]:
            double_female_count += count
        elif "♂" in match[1]:
            double_male_count += count

    return species_count


data = Data()


def check_full_location_data() -> None:
    global data

    if not data.coordinate_north and not data.coordinate_east:
        return
    info = get_location_info(data.coordinate_north, data.coordinate_east)
    info_address = info['address']

    if data.country == '' and 'country' in info_address.keys():
        data.country = info_address['country']
    if data.region == '' and 'region' in info_address.keys():
        data.region = info_address['region']
    if data.district == '' and 'district' in info_address.keys():
        data.district = info_address['district']

    if data.gathering_place == '' and 'display_name' in info.keys():
        data.gathering_place = info['display_name']


def get_separated_parameters(text: str) -> Data:
    global data

    data.clear()

    coords = get_coordinates(text)
    if coords:
        data.coordinate_north, data.coordinate_east = coords

    data.region = get_region(text)

    data.district = get_district(text)

    data.date = get_date(text)

    data.collector = get_collectors(text)

    species_count = get_numbers_species(text)

    for gender, count in species_count.items():
        if gender == 'male':
            data.count_males = count
        elif gender == 'female':
            data.count_females = count

    found_name, taxon_data = find_species_in_text(text)
    if found_name:
        data.family = taxon_data.get('семейство', '')
        data.genus = taxon_data.get('род', '')
        data.species = taxon_data.get('вид', '')
        
    check_full_location_data()

    return data


if __name__ == '__main__':
    print(get_coordinates('Рис. 3Г-З, 4Д-Ж'))
