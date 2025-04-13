import re
import sys

from text_processing.data import Data
from text_processing.geodecoder import get_location_info
from text_processing.gbif_parser import find_species_in_text

def get_coordinates(text: str) -> list:
    if not isinstance(text, str):
        return []
    coords_pattern = r'(\d{1,3}[.,]\d+|\d{1,3})\s*[⁰°]?\s*([NS])[,;]?\s*(\d{1,3}[.,]\d+|\d{1,3})\s*[⁰°]?\s*([EW])'
    coords_match = re.search(coords_pattern, text)
    try:
        if coords_match:
            coords = coords_match.group(0)
            coords_split_match = [float(coord.replace(',', '.')) for coord in re.findall(r'[-+]?\d+[.,]\d+', coords)]
            return coords_split_match
    except (ValueError, IndexError):
        return []

import re

# def get_coordinates(text: str) -> list:
#     if not isinstance(text, str):
#         return []
#     coords_pattern = r'''
#         ([-+]?\d{1,3}[°]\s*\d{1,2}['′]\s*\d{1,2}(?:\.\d+)?["″]?\s*[NS])|  # DD° MM' SS.SS" N/S
#         ([-+]?\d{1,3}[°]\s*\d{1,2}(?:\.\d+)?['′]?\s*[NS])|                 # DD° MM.MM' N/S
#         ([-+]?\d{1,3}(?:\.\d+)?\s*[NS])|                                  # DD.DD N/S
#         ([-+]?\d{1,3}[°]\s*\d{1,2}['′]\s*\d{1,2}(?:\.\d+)?["″]?\s*[WE])|  # DD° MM' SS.SS" E/W
#         ([-+]?\d{1,3}[°]\s*\d{1,2}(?:\.\d+)?['′]?\s*[WE])|                # DD° MM.MM' E/W
#         ([-+]?\d{1,3}(?:\.\d+)?\s*[WE])                                   # DD.DD E/W
#     '''
#     coords_match = re.findall(coords_pattern, text, re.VERBOSE)   
#     coordinates = []
#     for match_group in coords_match:
#         coord_str = next((x for x in match_group if x), '').strip()
#         if not coord_str:
#             continue
#         try:
#             direction = coord_str[-1].upper()
#             value_str = coord_str[:-1].strip()
#             if '°' in value_str:
#                 parts = re.split(r'[°\'"″′]', value_str)
#                 degrees = float(parts[0].strip())
#                 minutes = float(parts[1].strip()) if len(parts) > 1 and parts[1].strip() else 0
#                 seconds = float(parts[2].strip()) if len(parts) > 2 and parts[2].strip() else 0
#                 decimal_coord = degrees + (minutes / 60) + (seconds / 3600)
#             else:
#                 decimal_coord = float(value_str.replace(',', '.').strip())
#             if direction in ['S', 'W']:
#                 decimal_coord = -abs(decimal_coord)
#             coordinates.append(decimal_coord)
#         except (ValueError, IndexError):
#             continue
#     return coordinates
# # Тестовые примеры
# print(get_coordinates("45° 12' 34\" N, 93° 12' 34\" W"))  # [45.20944444444445, -93.20944444444444]
# print(get_coordinates("45.1234 N, 93.1234 W"))           # [45.1234, -93.1234]
# print(get_coordinates("45.1234 N | 93.1234 W"))          # [45.1234, -93.1234]
# print(get_coordinates("-45.1234 N, -93.1234 W"))         # [-45.1234, -93.1234]
# print(get_coordinates("45° 12.34' N, 93° 12' W"))        # [45.205666666666666, -93.2]
# print(get_coordinates("45°12′34″N 93°12′34″W"))         # [45.20944444444445, -93.20944444444444]
# print(get_coordinates("45.1234N 93.1234W"))              # [45.1234, -93.1234]

def get_region(text: str) -> str:
    if not isinstance(text, str):
        return ''
    try:
        region_pattern = r'([А-ЯЁA-Z][а-яёa-z-]+\sобл\.?)'
        region_match = re.search(region_pattern, text)
        return region_match.group(1) if region_match else ''
    except (AttributeError, IndexError, re.error):
        return ''
    


def get_district(text: str) -> str:
    if not isinstance(text, str):
        return ''
    try:
        district_pattern = r'([А-ЯЁA-Z][а-яёa-z-]+\sр-н)'
        district_match = re.search(district_pattern, text)
        return district_match.group(1) if district_match else ''
    except (AttributeError, IndexError, re.error):
        return ''


def get_date(text: str) -> str:
    if not isinstance(text, str):
        return ''
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
            if len(date_current) != 3:
                return ''
            if date_current[1].isalpha():
                date_current[1] = roman_months[date_current[1]]
                if not date_current[1]:
                    return ''
            
            try:
                day_int = int(date_current[0])
                year_int = int(date_current[2])
                if not (1 <= day_int <= 31) or not (1000 <= year_int <= 9999):
                    return ''
            except ValueError:
                return ''
            
            date_current[0], date_current[2] = date_current[2], date_current[0]
            date_current = '-'.join(date_current)
            return date_current
    except (AttributeError, IndexError, KeyError, ValueError, re.error):
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
    except (re.error, AttributeError, TypeError):
        pass
    return collectors


def get_numbers_species(text: str):
    if not isinstance(text, str):
        return {
            'male': 0, 'female': 0,
            'sub_male': 0, 'sub_female': 0,
            'juvenile': 0
        }
    try:
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
            try:
                count = int(count)
                if gender in ["♂", "male", "m", "M", "самец"]:
                    species_count['male'] += count
                elif gender in ["♀", "female", "f", "F", "самка"]:
                    species_count['female'] += count
            except (IndexError, ValueError):
                    continue
            
        # Subadults
        for count, gender in re.findall(subadult_pattern, text):
            try:
                count = int(count)
                if gender in ["sub♂", "submale", "subm", "subM", "sM", "субсамец"]:
                    species_count['sub_male'] += count
                elif gender in ["sub♀", "subfemale", "subf", "subF", "sF", "субсамка"]:
                    species_count['sub_female'] += count
            except (IndexError, ValueError):
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
            except (IndexError, ValueError, TypeError):
                    continue

        # Something weird
        for match in re.findall(double_sign_pattern, text):
            try:
                count = int(match[0]) if match[0] else 1
                if "♀" in match[1]:
                    double_female_count += count
                elif "♂" in match[1]:
                    double_male_count += count
            except (IndexError, ValueError):
                    continue
    except re.error:
        pass
    return species_count


data = Data()


def check_full_location_data() -> None:
    global data
    try:
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
    except Exception as e:
        print(f"Ошибка при заполнении географических данных: {str(e)}")

def get_separated_parameters(text: str) -> Data:

    global data

    data.clear()

    if not isinstance(text, str) or not text.strip():
        return data
    try:
        try:
            coords = get_coordinates(text)
            if coords:
                data.coordinate_north, data.coordinate_east = coords
        except (ValueError, IndexError, TypeError) as e:
                print(f"Ошибка обработки координат: {str(e)}")

        try:
            data.region = get_region(text)
            data.district = get_district(text)
        except Exception as e:
                print(f"Ошибка обработки региона/района: {str(e)}")

        try:
            data.date = get_date(text)
        except Exception as e:
                print(f"Ошибка обработки даты: {str(e)}")
        
        try:        
            data.collector = get_collectors(text)
        except Exception as e:
                print(f"Ошибка обработки сборщиков: {str(e)}")
        species_count = get_numbers_species(text)

        try:
            for gender, count in species_count.items():
                if gender == 'male':
                    data.count_males = count
                elif gender == 'female':
                    data.count_females = count
        except (ValueError, TypeError, AttributeError) as e:
                print(f"Ошибка обработки количества особей: {str(e)}")

        try:
            found_name, taxon_data = find_species_in_text(text)
            if found_name:
                data.family = taxon_data.get('семейство', '')
                data.genus = taxon_data.get('род', '')
                data.species = taxon_data.get('вид', '')
        except Exception as e:
                print(f"Ошибка обработки таксономических данных: {str(e)}")

        try: 
            check_full_location_data()
        except Exception as e:
                print(f"Ошибка заполнения географических данных: {str(e)}")

    except Exception as e:
        print(f"Критическая ошибка при обработке текста: {str(e)}")
    return data


if __name__ == '__main__':
    print(get_coordinates('Рис. 3Г-З, 4Д-Ж'))
