"""
Вспомогательные утилиты для работы с погодными данными
"""

from datetime import datetime
import pandas as pd


def date_to_day_of_year(date_str: str) -> int:
    """
    Конвертировать дату в день года
    
    Args:
        date_str: Дата в формате 'YYYY-MM-DD'
        
    Returns:
        День года (1-365/366)
    """
    date = datetime.strptime(date_str, '%Y-%m-%d')
    return date.timetuple().tm_yday


def day_of_year_to_date(day: int, year: int = 2024) -> str:
    """
    Конвертировать день года в дату
    
    Args:
        day: День года (1-365)
        year: Год (по умолчанию 2024)
        
    Returns:
        Дата в формате 'YYYY-MM-DD'
    """
    date = datetime(year, 1, 1) + pd.Timedelta(days=day - 1)
    return date.strftime('%Y-%m-%d')


def format_probability(probability: float) -> str:
    """
    Форматировать вероятность для отображения
    
    Args:
        probability: Вероятность (0.0 - 1.0)
        
    Returns:
        Строка с процентами
    """
    return f"{probability * 100:.1f}%"


def categorize_probability(probability: float) -> str:
    """
    Категоризировать вероятность для удобного описания
    
    Args:
        probability: Вероятность (0.0 - 1.0)
        
    Returns:
        Категория: 'very_low', 'low', 'moderate', 'high', 'very_high'
    """
    if probability < 0.10:
        return 'very_low'  # Очень маловероятно
    elif probability < 0.25:
        return 'low'  # Маловероятно
    elif probability < 0.50:
        return 'moderate'  # Умеренная вероятность
    elif probability < 0.75:
        return 'high'  # Высокая вероятность
    else:
        return 'very_high'  # Очень высокая вероятность


def get_probability_description(probability: float, condition: str) -> str:
    """
    Получить текстовое описание вероятности
    
    Args:
        probability: Вероятность (0.0 - 1.0)
        condition: Погодное условие
        
    Returns:
        Текстовое описание
    """
    category = categorize_probability(probability)
    percent = format_probability(probability)
    
    descriptions = {
        'very_low': f"Очень маловероятно ({percent})",
        'low': f"Маловероятно ({percent})",
        'moderate': f"Умеренная вероятность ({percent})",
        'high': f"Высокая вероятность ({percent})",
        'very_high': f"Очень высокая вероятность ({percent})"
    }
    
    return descriptions[category]


def validate_coordinates(latitude: float, longitude: float) -> bool:
    """
    Проверить корректность координат
    
    Args:
        latitude: Широта
        longitude: Долгота
        
    Returns:
        True если координаты валидны
    """
    if not (-90 <= latitude <= 90):
        return False
    if not (-180 <= longitude <= 180):
        return False
    return True


def get_season(day_of_year: int, hemisphere: str = 'north') -> str:
    """
    Определить сезон по дню года
    
    Args:
        day_of_year: День года (1-365)
        hemisphere: 'north' или 'south'
        
    Returns:
        Название сезона: 'winter', 'spring', 'summer', 'autumn'
    """
    # Для северного полушария
    if hemisphere == 'north':
        if day_of_year < 80 or day_of_year >= 355:  # Dec 21 - Mar 20
            return 'winter'
        elif day_of_year < 172:  # Mar 21 - Jun 20
            return 'spring'
        elif day_of_year < 266:  # Jun 21 - Sep 22
            return 'summer'
        else:  # Sep 23 - Dec 20
            return 'autumn'
    else:  # Южное полушарие (инвертировано)
        if day_of_year < 80 or day_of_year >= 355:
            return 'summer'
        elif day_of_year < 172:
            return 'autumn'
        elif day_of_year < 266:
            return 'winter'
        else:
            return 'spring'


def export_to_csv(data: dict, filename: str):
    """
    Экспортировать результаты в CSV
    
    Args:
        data: Словарь с результатами анализа
        filename: Имя файла для сохранения
    """
    df = pd.DataFrame([data])
    df.to_csv(filename, index=False)
    print(f"✓ Данные сохранены в {filename}")


def export_to_json(data: dict, filename: str):
    """
    Экспортировать результаты в JSON
    
    Args:
        data: Словарь с результатами анализа
        filename: Имя файла для сохранения
    """
    import json
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Данные сохранены в {filename}")
