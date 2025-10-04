"""
Weather Analysis Module - NASA Hackathon Project

Модуль для анализа вероятностей погодных условий
на основе исторических данных NASA

Основное использование:
    from weather_analysis import analyze_weather
    
    result = analyze_weather(
        latitude=55.7558,
        longitude=37.6173,
        date='2024-06-15'
    )
"""

__version__ = '1.0.0'
__author__ = 'NASA Hackathon Team'

from .data_service import WeatherDataService
from .statistical_analyzer import StatisticalAnalyzer
from .config import WeatherConfig
from .utils import date_to_day_of_year, format_probability, get_probability_description

# Главная функция для использования командой
def analyze_weather(latitude: float, 
                   longitude: float, 
                   date: str,
                   data_source: str = 'nasa',
                   years_range: tuple = (1990, 2023),
                   detailed: bool = False) -> dict:
    """
    Главная функция для анализа погодных условий
    
    Args:
        latitude: Широта (-90 до 90)
        longitude: Долгота (-180 до 180)
        date: Дата в формате 'YYYY-MM-DD'
        data_source: Источник данных ('nasa' или 'openmeteo')
        years_range: Диапазон лет для анализа (start, end)
        detailed: Вернуть детальный анализ или только summary
        
    Returns:
        Словарь с результатами анализа:
        {
            'location': {'latitude': ..., 'longitude': ...},
            'date': '2024-06-15',
            'day_of_year': 167,
            'probabilities': {
                'very_hot': 0.25,
                'very_cold': 0.05,
                ...
            },
            'statistics': {
                'temperature': {...},
                'precipitation': {...},
                ...
            },
            'metadata': {
                'data_source': 'NASA POWER API',
                'years_analyzed': '1990-2023',
                'data_points': 30
            }
        }
    
    Example:
        >>> result = analyze_weather(55.7558, 37.6173, '2024-06-15')
        >>> print(f"Вероятность очень жаркой погоды: {result['probabilities']['very_hot']*100:.1f}%")
    """
    # Валидация входных данных
    if not (-90 <= latitude <= 90):
        raise ValueError(f"Недопустимая широта: {latitude}. Должна быть от -90 до 90")
    
    if not (-180 <= longitude <= 180):
        raise ValueError(f"Недопустимая долгота: {longitude}. Должна быть от -180 до 180")
    
    # Конвертируем дату в день года
    day_of_year = date_to_day_of_year(date)
    
    print(f"\n{'='*60}")
    print(f"🌍 АНАЛИЗ ПОГОДНЫХ УСЛОВИЙ")
    print(f"{'='*60}")
    print(f"📍 Локация: ({latitude}, {longitude})")
    print(f"📅 Дата: {date} (день {day_of_year})")
    print(f"📊 Период анализа: {years_range[0]}-{years_range[1]}")
    print(f"{'='*60}\n")
    
    # Получаем данные
    data_service = WeatherDataService(preferred_source=data_source)
    
    try:
        historical_data, source = data_service.get_data(
            latitude, 
            longitude,
            start_year=years_range[0],
            end_year=years_range[1]
        )
        
        print(f"✓ Источник данных: {source}")
        print(f"✓ Получено записей: {len(historical_data)}\n")
        
    except Exception as e:
        return {
            'error': str(e),
            'location': {'latitude': latitude, 'longitude': longitude},
            'date': date
        }
    
    # Анализируем данные
    analyzer = StatisticalAnalyzer()
    
    if detailed:
        # Детальный анализ со всеми вероятностями
        analysis_result = analyzer.analyze_day(historical_data, day_of_year, latitude)
    else:
        # Упрощенный summary
        analysis_result = analyzer.get_summary_probabilities(historical_data, day_of_year, latitude)
    
    # Формируем финальный результат
    result = {
        'location': {
            'latitude': latitude,
            'longitude': longitude
        },
        'date': date,
        'day_of_year': day_of_year,
        'date_name': analysis_result.get('date_example', ''),
        'probabilities': analysis_result.get('probabilities', {}),
        'statistics': analysis_result.get('statistics', {}),
        'metadata': {
            'data_source': source,
            'years_analyzed': f"{years_range[0]}-{years_range[1]}",
            'data_points': analysis_result.get('data_points', 0),
            'analysis_type': 'detailed' if detailed else 'summary'
        }
    }
    
    # Печатаем результаты
    _print_results(result)
    
    return result


def _print_results(result: dict):
    """Печатать результаты анализа в консоль"""
    print(f"\n{'='*60}")
    print(f"📊 РЕЗУЛЬТАТЫ АНАЛИЗА")
    print(f"{'='*60}\n")
    
    probs = result['probabilities']
    
    print("🌡️  ТЕМПЕРАТУРНЫЕ УСЛОВИЯ:")
    print(f"   • Очень холодно:  {format_probability(probs.get('very_cold', 0))}")
    print(f"   • Холодно:        {format_probability(probs.get('cold', 0))}")
    print(f"   • Комфортно:      {format_probability(probs.get('comfortable', 0))}")
    print(f"   • Жарко:          {format_probability(probs.get('hot', 0))}")
    print(f"   • Очень жарко:    {format_probability(probs.get('very_hot', 0))}")
    
    print("\n💧 ОСАДКИ И ВЕТЕР:")
    print(f"   • Очень влажно:   {format_probability(probs.get('very_wet', 0))}")
    print(f"   • Очень ветрено:  {format_probability(probs.get('very_windy', 0))}")
    
    print("\n😊 ОБЩИЙ КОМФОРТ:")
    print(f"   • Очень некомфортно: {format_probability(probs.get('very_uncomfortable', 0))}")
    
    # Статистика
    if 'temperature' in result['statistics']:
        temp_stats = result['statistics']['temperature']
        print(f"\n📈 СРЕДНЯЯ ТЕМПЕРАТУРА:")
        print(f"   • Среднее: {temp_stats['mean']:.1f}°C")
        print(f"   • Мин: {temp_stats.get('min', 'N/A') if temp_stats.get('min') else 'N/A'}")
        print(f"   • Макс: {temp_stats.get('max', 'N/A') if temp_stats.get('max') else 'N/A'}")
    
    print(f"\n{'='*60}\n")


# Дополнительная функция для пакетного анализа
def analyze_multiple_dates(latitude: float,
                          longitude: float, 
                          dates: list,
                          data_source: str = 'nasa') -> list:
    """
    Анализировать несколько дат за один раз
    
    Args:
        latitude: Широта
        longitude: Долгота
        dates: Список дат в формате 'YYYY-MM-DD'
        data_source: Источник данных
        
    Returns:
        Список результатов для каждой даты
    """
    results = []
    
    # Получаем данные один раз
    data_service = WeatherDataService(preferred_source=data_source)
    historical_data, source = data_service.get_data(latitude, longitude)
    
    analyzer = StatisticalAnalyzer()
    
    for date in dates:
        day_of_year = date_to_day_of_year(date)
        analysis = analyzer.get_summary_probabilities(historical_data, day_of_year, latitude)
        
        result = {
            'date': date,
            'day_of_year': day_of_year,
            'probabilities': analysis['probabilities'],
            'statistics': analysis['statistics']
        }
        
        results.append(result)
    
    return results


# Экспорт главных компонентов
__all__ = [
    'analyze_weather',
    'analyze_multiple_dates',
    'WeatherDataService',
    'StatisticalAnalyzer',
    'WeatherConfig',
    'date_to_day_of_year',
    'format_probability',
    'get_probability_description'
]
