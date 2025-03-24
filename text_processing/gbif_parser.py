from pygbif import species as gbif_species
import re

def extract_latin_words(text):
    #Извлекает слова на латинице из текста
    return re.findall(r'\b[A-Za-z]+\b', text)

def find_species_in_text(text):
    # поиск названия видов среди подряд идущих слов на латинице
    latin_words = extract_latin_words(text)
    
    for i in range(len(latin_words) - 1):
        candidate = f"{latin_words[i]} {latin_words[i+1]}"
        is_valid, data = validate_species_name(candidate)
        
        if is_valid and not data.get('error'):
            return candidate, data
    
    return None, None

def get_taxon_info(scientific_name):
    # Поиск названия в GBIF
    try:
        return gbif_species.name_backbone(
            name=scientific_name, 
            rank='species', 
            strict=True
        )
    except Exception:
        return None

def validate_species_name(scientific_name):
    # Проверяет название вида и возвращает таксономические данные
    parts = scientific_name.strip().split()
    if len(parts) != 2:
        return False, {"error": "Некорректный формат названия"}
    
    taxon_data = get_taxon_info(scientific_name)
    if not taxon_data:
        return False, {"error": "Невалидное название или ошибка запроса"}
    
    if taxon_data.get('rank') != 'SPECIES':
        return False, {"error": "Невалидное название"}
    
    return True, {
        "семейство": taxon_data.get('family', 'Неизвестно'),
        "род": parts[0],
        "вид": parts[1],
    }


if __name__ == "__main__":
    while True:
        text = input("Введите текст для анализа (пример: 'Runcinia tarabayevi Marusik et Logunov, 1990 Материал. 1 ♂, Челябинская обл., Троицкий р-н, заказник Троицкий, березовый колок, укосы, 29.VI.2023, Устинова А.Л.'): ")
        found_name, data = find_species_in_text(text)
        
        if not found_name:
            print("Валидные названия не обнаружены")
            continue
        
        print(f"""
        Найдено видовое название: {found_name}
        Семейство: {data['семейство']}
        Род: {data['род']}
        Вид: {data['вид']}
        """)