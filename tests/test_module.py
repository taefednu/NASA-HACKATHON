#!/usr/bin/env python3
"""
Тестовый скрипт для проверки работоспособности модуля weather_analysis
"""

import sys
sys.path.append('..')

print("="*70)
print("🧪 ТЕСТИРОВАНИЕ МОДУЛЯ WEATHER_ANALYSIS")
print("="*70)

# Тест 1: Импорт модуля
print("\n[1/5] Тест импорта модуля...")
try:
    from weather_analysis import analyze_weather, WeatherDataService
    print("✅ Модуль успешно импортирован")
except Exception as e:
    print(f"❌ Ошибка импорта: {e}")
    sys.exit(1)

# Тест 2: Проверка подключения к API
print("\n[2/5] Тест подключения к источникам данных...")
try:
    service = WeatherDataService()
    sources = service.test_connection()
    
    for source, available in sources.items():
        status = "✅ Доступен" if available else "❌ Недоступен"
        print(f"  {source}: {status}")
    
    if not any(sources.values()):
        print("⚠️  Внешние API недоступны. Будем использовать Mock данные для тестирования.")
        # Не выходим, продолжаем с mock данными
        
except Exception as e:
    print(f"❌ Ошибка подключения: {e}")
    sys.exit(1)

# Тест 3: Получение данных
print("\n[3/5] Тест получения данных...")
try:
    # Используем сервис (он автоматически переключится на mock если API недоступны)
    data, source = service.get_data(
        latitude=55.7558,
        longitude=37.6173,
        start_year=2020,
        end_year=2023
    )
    print(f"✅ Данные успешно получены от {source}")
    print(f"  Размер данных: {data.shape}")
    
except Exception as e:
    print(f"❌ Ошибка получения данных: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Тест 4: Анализ погоды
print("\n[4/5] Тест анализа погоды...")
try:
    result = analyze_weather(
        latitude=55.7558,
        longitude=37.6173,
        date='2024-06-15'
    )
    
    if 'error' in result:
        print(f"❌ Ошибка анализа: {result['error']}")
        sys.exit(1)
    
    print("✅ Анализ выполнен успешно")
    print(f"  Вероятность жары: {result['probabilities']['very_hot']*100:.1f}%")
    
except Exception as e:
    print(f"❌ Ошибка анализа: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Тест 5: Экспорт данных
print("\n[5/5] Тест экспорта данных...")
try:
    from weather_analysis.utils import export_to_json
    
    export_to_json(result, '../data/exports/test_export.json')
    print("✅ Данные успешно экспортированы")
    
except Exception as e:
    print(f"❌ Ошибка экспорта: {e}")
    sys.exit(1)

# Все тесты пройдены
print("\n" + "="*70)
print("🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!")
print("="*70)
print("\n✨ Модуль готов к использованию!")
print("\nДальнейшие шаги:")
print("  1. Запустите примеры: python example_usage.py")
print("  2. Запустите Jupyter: jupyter lab ../notebooks/01_data_exploration.ipynb")
print("  3. Запустите API: cd ../backend && python api.py")
print()
