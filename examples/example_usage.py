"""
Примеры использования модуля weather_analysis

Этот файл показывает как использовать модуль для анализа погоды
"""

import sys
sys.path.append('..')

from weather_analysis import analyze_weather, analyze_multiple_dates

# ============================================================================
# ПРИМЕР 1: Базовый анализ для одной даты
# ============================================================================

print("\n" + "="*70)
print("ПРИМЕР 1: Анализ погоды для Москвы на 15 июня")
print("="*70)

result = analyze_weather(
    latitude=55.7558,    # Москва
    longitude=37.6173,
    date='2024-06-15'
)

# Получаем вероятности
probs = result['probabilities']
print(f"\n✨ Вероятность очень жаркой погоды: {probs['very_hot']*100:.1f}%")
print(f"✨ Вероятность дождя: {probs['very_wet']*100:.1f}%")

# ============================================================================
# ПРИМЕР 2: Детальный анализ с полной статистикой
# ============================================================================

print("\n" + "="*70)
print("ПРИМЕР 2: Детальный анализ для Нью-Йорка")
print("="*70)

result_detailed = analyze_weather(
    latitude=40.7128,    # Нью-Йорк
    longitude=-74.0060,
    date='2024-07-04',
    detailed=True  # Получить детальную информацию
)

# Выводим статистику температуры
temp_stats = result_detailed['statistics']['temperature']
print(f"\n📊 Статистика температуры:")
print(f"   Среднее: {temp_stats['mean']:.1f}°C")
print(f"   Мин: {temp_stats['min']:.1f}°C")
print(f"   Макс: {temp_stats['max']:.1f}°C")

# ============================================================================
# ПРИМЕР 3: Анализ нескольких дат (планирование отпуска)
# ============================================================================

print("\n" + "="*70)
print("ПРИМЕР 3: Планирование отпуска в Сочи")
print("="*70)

dates_to_check = [
    '2024-07-01',  # Начало июля
    '2024-07-15',  # Середина июля
    '2024-08-01',  # Начало августа
    '2024-08-15'   # Середина августа
]

results = analyze_multiple_dates(
    latitude=43.6028,   # Сочи
    longitude=39.7342,
    dates=dates_to_check
)

print("\n📅 Сравнение дат:")
for r in results:
    probs = r['probabilities']
    print(f"\n  {r['date']}:")
    print(f"    🌡️  Очень жарко: {probs['very_hot']*100:.1f}%")
    print(f"    💧 Дождь: {probs['very_wet']*100:.1f}%")
    print(f"    😊 Комфортно: {probs['comfortable']*100:.1f}%")

# ============================================================================
# ПРИМЕР 4: Использование запасного источника данных (Open-Meteo)
# ============================================================================

print("\n" + "="*70)
print("ПРИМЕР 4: Использование Open-Meteo (если NASA недоступен)")
print("="*70)

try:
    result_openmeteo = analyze_weather(
        latitude=51.5074,    # Лондон
        longitude=-0.1278,
        date='2024-08-20',
        data_source='openmeteo'  # Используем Open-Meteo
    )
    
    print(f"✓ Источник данных: {result_openmeteo['metadata']['data_source']}")
    
except Exception as e:
    print(f"⚠ Ошибка: {e}")

# ============================================================================
# ПРИМЕР 5: Экспорт результатов
# ============================================================================

print("\n" + "="*70)
print("ПРИМЕР 5: Экспорт результатов в файлы")
print("="*70)

from weather_analysis.utils import export_to_json, export_to_csv

result = analyze_weather(
    latitude=48.8566,    # Париж
    longitude=2.3522,
    date='2024-09-01'
)

# Сохраняем в JSON
export_to_json(result, './data/exports/paris_analysis.json')

# Сохраняем в CSV
export_to_csv(result, './data/exports/paris_analysis.csv')

print("\n✨ Все примеры выполнены!")
print("="*70 + "\n")

# ============================================================================
# ПРИМЕР 6: Простое использование в коде
# ============================================================================

def check_vacation_weather(lat, lon, start_date, end_date):
    """
    Функция для проверки погоды на период отпуска
    Возвращает рекомендацию
    """
    from datetime import datetime, timedelta
    
    # Генерируем список дат
    start = datetime.strptime(start_date, '%Y-%m-%d')
    end = datetime.strptime(end_date, '%Y-%m-%d')
    dates = []
    
    current = start
    while current <= end:
        dates.append(current.strftime('%Y-%m-%d'))
        current += timedelta(days=1)
    
    # Анализируем
    results = analyze_multiple_dates(lat, lon, dates)
    
    # Подсчитываем средние вероятности
    avg_hot = sum(r['probabilities']['very_hot'] for r in results) / len(results)
    avg_rain = sum(r['probabilities']['very_wet'] for r in results) / len(results)
    avg_comfortable = sum(r['probabilities']['comfortable'] for r in results) / len(results)
    
    print(f"\n🏖️  РЕКОМЕНДАЦИЯ ДЛЯ ОТПУСКА:")
    print(f"   Период: {start_date} - {end_date}")
    print(f"   Средняя вероятность жаркой погоды: {avg_hot*100:.1f}%")
    print(f"   Средняя вероятность дождя: {avg_rain*100:.1f}%")
    print(f"   Средняя вероятность комфортной погоды: {avg_comfortable*100:.1f}%")
    
    if avg_comfortable > 0.6:
        print(f"   ✅ Отличное время для отпуска!")
    elif avg_rain > 0.3:
        print(f"   ⚠️  Возможны дожди, возьмите зонт!")
    elif avg_hot > 0.5:
        print(f"   ☀️  Будет жарко, не забудьте солнцезащитный крем!")
    
    return results

# Используем функцию
print("\n" + "="*70)
print("ПРИМЕР 6: Функция для планирования отпуска")
print("="*70)

check_vacation_weather(
    lat=35.6762,      # Токио
    lon=139.6503,
    start_date='2024-10-01',
    end_date='2024-10-07'
)
