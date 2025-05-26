from pygbif import species as gbif_species
import re
import logging

logger = logging.getLogger(__name__)


def get_taxon_info(scientific_name: str) -> gbif_species:
    try:
        return gbif_species.name_backbone(
            name=scientific_name,
            rank='species',
            strict=True
        )
    except Exception as e:
        logger.error(f'GBIF Error: {str(e)}', exc_info=True)
        raise Exception(scientific_name) from e


def validate_species_name(scientific_name: str) -> [bool, dict]:
    parts = scientific_name.strip().split()
    if len(parts) != 2:
        logger.warning('Incorrect format name')
        return False, {'error': 'Некорректный формат названия'}
    
    taxon_data = get_taxon_info(scientific_name)
    if not taxon_data:
        logger.warning('Invalid name or request error')
        return False, {'error': 'Невалидное название или ошибка запроса'}
    
    if taxon_data.get('rank') != 'SPECIES':
        logger.warning('Invalid name')
        return False, {'error': 'Невалидное название'}
    
    return True, {
        'семейство': taxon_data.get('family', 'Неизвестно'),
        'род': parts[0],
        'вид': parts[1],
    }


def find_species_in_text(text: str) -> [str, dict]:
    latin_words = re.findall(r'\b[A-Za-z]+\b', text)

    for i in range(len(latin_words) - 1):
        candidate = f'{latin_words[i]} {latin_words[i + 1]}'
        is_valid, data = validate_species_name(candidate)

        if is_valid and not data.get('error'):
            return candidate, data

    return None, None
