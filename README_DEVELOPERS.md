# 🔧 NASA Weather Analysis - Developer Documentation v2.0

## Полная документация для разработчиков

Этот документ содержит всю информацию необходимую для интеграции модуля анализа погоды в ваш проект.

**🆕 НОВОЕ в v2.0:**
- 🌐 Мультисорсный подход (4 источника данных)
- 🔬 Консенсус-анализ для повышения точности
- 🌡️ 7 новых категорий параметров (ощущаемая температура, качество воздуха, грозы)
- 📊 14+ новых вероятностей и статистик
- ✨ Интерполяция до ~100м точности

---

## 📚 Содержание

1. [Архитектура проекта](#архитектура-проекта) 🆕
2. [Быстрый старт](#быстрый-старт)
3. [Источники данных](#источники-данных) 🆕
4. [API Reference](#api-reference)
5. [Структура данных](#структура-данных)
6. [Все переменные](#все-переменные) 🆕
7. [Интеграция](#интеграция)
8. [Примеры использования](#примеры-использования)
9. [Единицы измерения](#единицы-измерения)
10. [Обработка ошибок](#обработка-ошибок)

---

## 🏗️ Архитектура проекта

### Структура файлов

```
weather_analysis/
├── __init__.py              # Главные функции: analyze_weather(), analyze_weather_range()
├── config.py                # Конфигурация: пороги, параметры, формулы
├── data_service.py          # Получение данных из NASA POWER и Open-Meteo
├── data_adapters.py         # 🆕 Адаптеры: GES DISC, CPTEC, Open-Meteo Enhanced
├── multi_source_service.py  # 🆕 Мультисорсный сервис с консенсус-анализом
├── statistical_analyzer.py  # Статистический анализ и расчет вероятностей
├── ml_predictor.py          # ML тренды и экстраполяция на будущее
├── utils.py                 # Утилиты: конвертация единиц, форматирование
└── mock_data.py             # Mock данные для тестирования

backend/
└── api.py                   # Flask REST API endpoints
```

### Описание ключевых модулей

#### 📄 `config.py`
Конфигурация системы:
- Пороги для 15+ погодных параметров (температура, ветер, осадки, UV, качество воздуха, грозы)
- Списки параметров для каждого источника (NASA, Open-Meteo, GES DISC, CPTEC)
- Коды погоды WMO (0-99)
- Формулы расчета: ощущаемая температура, heat index, wind chill
- Конфигурация мультисорсного подхода (веса источников, консенсус)

#### 📄 `data_service.py`
Получение исторических данных:
- `WeatherDataService` - главный класс для получения данных
- `NASAPowerAPI` - работа с NASA POWER API (0.5° сетка)
- `OpenMeteoAPI` - резервный источник
- `interpolate_point()` - билинейная интерполяция для точности ~100м
- Кэширование данных в parquet файлах

#### 📄 `data_adapters.py` 🆕
Адаптеры для дополнительных источников:
- `GESDISCAdapter` - качество воздуха (AOD, черный углерод, пыль)
- `CPTECAdapter` - грозовая активность (CAPE) для Южной Америки
- `OpenMeteoEnhancedAdapter` - расширенные параметры Open-Meteo
- Единый интерфейс `fetch_data()` для всех источников

#### 📄 `multi_source_service.py` 🆕
Мультисорсный анализ:
- `MultiSourceDataService` - параллельный запрос к 4 источникам
- `fetch_multi_source_data()` - параллельное получение с ThreadPoolExecutor
- `calculate_consensus()` - консенсус-анализ с весами источников
- `_calculate_agreement()` - уровень согласованности (0-1)
- Доверительные интервалы и флаги качества

#### 📄 `statistical_analyzer.py`
Статистический анализ:
- `StatisticalAnalyzer` - расчет вероятностей на основе исторических данных
- 13 методов анализа (`_analyze_temperature`, `_analyze_precipitation`, и т.д.)
- 5 новых методов: ощущаемая температура, коды погоды, порывы ветра, качество воздуха, грозы
- `_calculate_statistics()` - средние, min/max, перцентили
- Анализ диапазонов дат с агрегацией

#### 📄 `ml_predictor.py`
ML анализ трендов:
- `TrendAnalyzer` - анализ температурных трендов
- `analyze_temperature_trend()` - линейная регрессия на 10 лет данных
- `extrapolate_to_year()` - экстраполяция на будущие годы
- Решает проблему идентичных прогнозов для разных годов

#### 📄 `utils.py`
Утилиты:
- Конвертация единиц: температура (C/F), ветер (m/s, km/h, mph), осадки (mm, in), давление
- `convert_result_units()` - конвертация всего результата
- Форматирование вероятностей и дат
- Экспорт в JSON/CSV

#### 📄 `backend/api.py`
REST API:
- `POST /api/analyze` - анализ одной даты
- `POST /api/analyze-range` - анализ диапазона дат
- `GET /api/data-sources` 🆕 - информация об источниках
- `GET /api/health` - статус системы
- Поддержка параметра `use_multi_source` для мультисорсного режима

---

## 🌍 Источники данных

Система поддерживает 4 источника данных:

### 1. NASA POWER (основной)
- **Покрытие:** Глобальное
- **Разрешение:** 0.5° × 0.5° (~55км), с интерполяцией до ~100м
- **Параметры:** 17+ (температура, осадки, ветер, влажность, давление, облачность, UV, снег)
- **Период:** 1981-2023
- **Надежность:** 95%

### 2. Open-Meteo (расширенный)
- **Покрытие:** Глобальное
- **Разрешение:** ~11км
- **Параметры:** Ощущаемая температура, коды погоды WMO, порывы ветра
- **Период:** 1940-настоящее время
- **Надежность:** 90%

### 3. NASA GES DISC (качество воздуха)
- **Покрытие:** Глобальное
- **Параметры:** AOD (Aerosol Optical Depth), черный углерод, пыль, SO2, сульфаты
- **Источник:** MERRA-2
- **Надежность:** 95%
- **Статус:** Mock данные (требуется авторизация NASA Earthdata)

### 4. Brazilian CPTEC (грозы)
- **Покрытие:** Южная Америка
- **Параметры:** CAPE (энергия конвекции), CIN, индекс неустойчивости
- **Применение:** Прогноз гроз и сильной конвекции
- **Надежность:** 85%

### Мультисорсный режим

Когда `use_multi_source=True`:
1. Параллельный запрос ко всем доступным источникам
2. Консенсус-анализ: вычисление взвешенного среднего
3. Определение уровня согласованности (agreement level)
4. Доверительные интервалы (confidence intervals)
5. Флаги качества: high / medium / low / very_low

**Пример:**
```python
result = analyze_weather(
    latitude=55.7558,
    longitude=37.6173,
    date='2026-07-15',
    use_multi_source=True  # 🆕 Мультисорсный режим
)

# result содержит данные из нескольких источников
# с консенсусными значениями и доверительными интервалами
```

---

## 🚀 Быстрый старт

### Установка

```bash
cd NASA
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Первый запрос

```python
from weather_analysis import analyze_weather

result = analyze_weather(
    latitude=55.7558,    # Москва
    longitude=37.6173,
    date='2026-07-15'
)

print(result['probabilities']['very_hot'])  # Вероятность жары
```

---

## 📖 API Reference

### 1. `analyze_weather()` - Анализ одной даты

**Назначение:** Анализ вероятностей погодных условий для конкретной даты

**Импорт:**
```python
from weather_analysis import analyze_weather
```

**Параметры:**

| Параметр | Тип | Обязательный | По умолчанию | Описание |
|----------|-----|--------------|--------------|----------|
| `latitude` | float | ✅ Да | - | Широта (-90 до 90) |
| `longitude` | float | ✅ Да | - | Долгота (-180 до 180) |
| `date` | str | ✅ Да | - | Дата в формате 'YYYY-MM-DD' |
| `data_source` | str | ❌ Нет | 'nasa' | Источник данных: 'nasa' или 'openmeteo' |
| `years_range` | tuple | ❌ Нет | (1990, 2023) | Диапазон лет для анализа |
| `detailed` | bool | ❌ Нет | False | Детальный анализ (больше категорий) |
| `units` | dict | ❌ Нет | None | Единицы измерения (см. раздел Единицы) |

**Возвращает:** `dict` с результатами анализа

**Пример:**
```python
result = analyze_weather(
    latitude=55.7558,
    longitude=37.6173,
    date='2026-07-15',
    data_source='nasa',
    years_range=(2010, 2023),
    detailed=False,
    units={
        'temperature': 'fahrenheit',
        'wind_speed': 'mph'
    }
)
```

---

### 2. `analyze_weather_range()` - Анализ диапазона дат

**Назначение:** Анализ погоды для периода времени с агрегацией и детализацией

**Импорт:**
```python
from weather_analysis import analyze_weather_range
```

**Параметры:**

| Параметр | Тип | Обязательный | По умолчанию | Описание |
|----------|-----|--------------|--------------|----------|
| `latitude` | float | ✅ Да | - | Широта (-90 до 90) |
| `longitude` | float | ✅ Да | - | Долгота (-180 до 180) |
| `start_date` | str | ✅ Да | - | Начальная дата 'YYYY-MM-DD' |
| `end_date` | str | ✅ Да | - | Конечная дата 'YYYY-MM-DD' |
| `data_source` | str | ❌ Нет | 'nasa' | Источник данных |
| `years_range` | tuple | ❌ Нет | (1990, 2023) | Диапазон лет |
| `units` | dict | ❌ Нет | None | Единицы измерения |

**Возвращает:** `dict` с агрегированными данными и разбивкой по дням

**Пример:**
```python
result = analyze_weather_range(
    latitude=55.7558,
    longitude=37.6173,
    start_date='2026-01-12',
    end_date='2026-01-21'
)

# Средняя температура за период
print(result['aggregated']['statistics']['temperature']['mean'])

# Лучший день для активности
print(result['aggregated']['best_days']['outdoor_activity'])

# Детали каждого дня
for day in result['daily_breakdown']:
    print(f"{day['date']}: {day['statistics']['temperature']['mean']}°C")
```

---

### 3. REST API Endpoints

#### Base URL
```
http://localhost:5000
```

#### GET `/` - Информация об API
**Response:**
```json
{
  "message": "NASA Weather Probability API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

#### POST `/api/analyze` - Анализ одной даты

**Request Body:**
```json
{
  "latitude": 55.7558,
  "longitude": 37.6173,
  "date": "2026-07-15",
  "data_source": "nasa",
  "detailed": false,
  "units": {
    "temperature": "fahrenheit",
    "wind_speed": "mph",
    "precipitation": "inches",
    "pressure": "inhg"
  }
}
```

**Response:** (см. [Структура данных](#структура-данных))

#### POST `/api/analyze-range` - Анализ диапазона

**Request Body:**
```json
{
  "latitude": 55.7558,
  "longitude": 37.6173,
  "start_date": "2026-01-12",
  "end_date": "2026-01-21",
  "data_source": "nasa",
  "units": {
    "temperature": "celsius"
  }
}
```

#### GET `/api/health` - Проверка работоспособности

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-04T20:00:00",
  "data_sources": {
    "NASA": true,
    "OpenMeteo": true
  }
}
```

---

## 📊 Структура данных

### Результат `analyze_weather()`

```python
{
  "location": {
    "latitude": 55.7558,
    "longitude": 37.6173
  },
  "date": "2026-07-15",
  "day_of_year": 196,
  "date_name": "July 15",
  
  # ВЕРОЯТНОСТИ (0.0 - 1.0)
  "probabilities": {
    # Температура
    "very_cold": 0.0,        # < 0°C (или < 10-й перцентиль)
    "cold": 0.05,            # < 10°C (или < 25-й перцентиль)
    "comfortable": 0.30,     # 15-25°C
    "hot": 0.45,             # > 25°C (или > 75-й перцентиль)
    "very_hot": 0.10,        # > 30°C (или > 90-й перцентиль)
    
    # Осадки
    "very_wet": 0.05,        # > 100 мм/день
    
    # Ветер
    "very_windy": 0.02,      # > 20 м/с
    "strong_wind": 0.08,     # 15-20 м/с
    "moderate_wind": 0.25,   # 10-15 м/с
    "calm": 0.15,            # < 2 м/с
    
    # Комфорт
    "very_uncomfortable": 0.05,  # Heat index > 40°C
    "uncomfortable_hot": 0.15,   # Жарко + влажно
    
    # Облачность
    "clear": 0.30,           # < 25% облачности
    "partly_cloudy": 0.40,   # 25-50%
    "mostly_cloudy": 0.20,   # 50-75%
    "overcast": 0.10,        # > 90%
    
    # UV индекс
    "low_uv": 0.15,          # < 2
    "moderate_uv": 0.40,     # 2-5
    "high_uv": 0.30,         # 5-7
    "very_high_uv": 0.10,    # 7-10
    "extreme_uv": 0.05,      # > 11
    
    # Давление
    "very_low_pressure": 0.05,   # < 98 кПа (циклон)
    "low_pressure": 0.20,         # 98-100 кПа
    "normal_pressure": 0.50,      # 100-103 кПа
    "high_pressure": 0.20,        # 103-104.5 кПа
    "very_high_pressure": 0.05,   # > 104.5 кПа (антициклон)
    
    # Снег (зимой)
    "no_snow": 0.70,         # 0 см
    "light_snow": 0.15,      # 0-5 см
    "moderate_snow": 0.10,   # 5-15 см
    "heavy_snow": 0.04,      # 15-30 см
    "very_heavy_snow": 0.01  # > 50 см
  },
  
  # СТАТИСТИКА (реальные значения)
  "statistics": {
    "temperature": {
      "mean": 18.2,          # Средняя температура
      "min": 12.5,           # Минимальная за период
      "max": 27.5,           # Максимальная за период
      "std": 3.8,            # Стандартное отклонение
      "percentile_10": 14.2, # 10-й перцентиль
      "percentile_90": 23.5, # 90-й перцентиль
      "unit": "°C"           # Единица измерения
    },
    "dew_point": {
      "mean": 12.5,
      "min": 8.0,
      "max": 18.0,
      "unit": "°C"
    },
    "precipitation": {
      "mean": 9.5,           # Средние осадки в день
      "max": 45.2,           # Максимум за день
      "std": 12.3,
      "percentile_90": 28.0,
      "unit": "mm"
    },
    "wind": {
      "mean": 2.6,           # Средняя скорость ветра (2м)
      "max": 8.5,
      "std": 1.4,
      "percentile_90": 4.2,
      "unit": "m/s"
    },
    "wind_10m": {
      "mean": 3.2,           # Скорость на 10м
      "max": 10.1,
      "unit": "m/s"
    },
    "humidity": {
      "mean": 65.5,
      "min": 40.0,
      "max": 95.0,
      "std": 12.8,
      "unit": "%"
    },
    "cloudiness": {
      "mean": 52.3,          # % облачного покрытия
      "min": 10.0,
      "max": 100.0,
      "unit": "%"
    },
    "uv_index": {
      "mean": 4.5,
      "max": 7.2,
      "unit": "index"
    },
    "solar_radiation": {
      "mean": 5.8,           # кВт-ч/м²/день
      "max": 8.5,
      "unit": "kWh/m²/day"
    },
    "pressure": {
      "mean": 98.9,
      "min": 95.2,
      "max": 102.3,
      "std": 1.5,
      "unit": "kPa"
    },
    "snow_depth": {
      "mean": 0.0,
      "max": 0.0,
      "unit": "cm"
    }
  },
  
  # МЕТАДАННЫЕ
  "metadata": {
    "data_source": "NASA POWER API (интерполяция)",
    "years_analyzed": "1990-2023",
    "data_points": 34,       # Количество лет в выборке
    "analysis_type": "summary"
  }
}
```

### Результат `analyze_weather_range()`

```python
{
  "location": { ... },       # То же что в analyze_weather
  
  "date_range": {
    "start": "2026-01-12",
    "end": "2026-01-21",
    "duration_days": 10
  },
  
  # АГРЕГИРОВАННЫЕ ДАННЫЕ за весь период
  "aggregated": {
    "probabilities": {
      # Средние вероятности за 10 дней
      "very_hot": 0.05,
      "cold": 0.65,
      ...
    },
    "statistics": {
      "temperature": {
        "mean": -9.7,        # Средняя за период
        "min": -15.2,        # Минимум за период
        "max": -5.3,         # Максимум за период
        "std": 2.8
      },
      "precipitation": {
        "mean": 1.8,         # Средние осадки в день
        "total": 18.2,       # Всего за период
        "max": 5.2
      },
      ...
    },
    "best_days": {
      "outdoor_activity": "2026-01-15",  # Лучший день
      "minimal_rain": "2026-01-12",      # Минимум осадков
      "warmest": "2026-01-14",           # Самый теплый
      "coldest": "2026-01-21"            # Самый холодный
    }
  },
  
  # ДЕТАЛИ ПО КАЖДОМУ ДНЮ
  "daily_breakdown": [
    {
      "date": "2026-01-12",
      "day_of_year": 12,
      "day_name": "Monday",
      "probabilities": { ... },
      "statistics": { ... },
      "data_points": 34
    },
    {
      "date": "2026-01-13",
      ...
    },
    ...
  ],
  
  "metadata": { ... }
}
```

---

## � Все переменные

Полный справочник всех переменных системы, разделенных на категории для фронтенда.

### 🔹 Входящие данные (RAW от API)

Это параметры, которые приходят напрямую из источников данных:

#### NASA POWER (17 параметров):
| Параметр | Описание | Единицы | Зависимости |
|----------|----------|---------|-------------|
| `T2M` | Температура на 2м | °C | - |
| `T2M_MAX` | Макс температура | °C | - |
| `T2M_MIN` | Мин температура | °C | - |
| `T2MDEW` | Точка росы | °C | - |
| `PRECTOTCORR` | Осадки | mm/день | - |
| `WS2M` | Ветер на 2м | m/s | - |
| `WS10M` | Ветер на 10м | m/s | - |
| `RH2M` | Влажность | % | - |
| `PS` | Давление | кПа | - |
| `CLOUD_AMT` | Облачность | % | - |
| `ALLSKY_SFC_SW_DWN` | Солнечная радиация | кВт-ч/м²/день | - |
| `ALLSKY_SFC_UV_INDEX` | UV индекс | - | - |
| `QV2M` | Удельная влажность | kg/kg | - |
| `SNODP` | Глубина снега | см | - |

#### Open-Meteo Enhanced (7 параметров) 🆕:
| Параметр | Описание | Единицы | Зависимости |
|----------|----------|---------|-------------|
| `apparent_temperature_mean` | Ощущаемая температура | °C | `T2M`, `RH2M`, `WS2M` |
| `weathercode` | Код погоды WMO (0-99) | - | - |
| `windgusts_10m_max` | Порывы ветра | m/s | - |
| `temperature_2m_mean` | Температура на 2м | °C | - |
| `precipitation_sum` | Сумма осадков | mm | - |
| `windspeed_10m_max` | Макс ветер | m/s | - |
| `relativehumidity_2m_mean` | Влажность | % | - |

#### GES DISC (качество воздуха, 3 параметра) 🆕:
| Параметр | Описание | Единицы | Зависимости |
|----------|----------|---------|-------------|
| `AODANA` | Оптическая толщина аэрозоля | безразмерная | - |
| `BCSMASS` | Черный углерод | μg/m³ | - |
| `DUSMASS` | Пыль | μg/m³ | - |

#### CPTEC (грозы, 1 параметр) 🆕:
| Параметр | Описание | Единицы | Зависимости |
|----------|----------|---------|-------------|
| `cape` | Энергия конвекции (CAPE) | J/kg | - |

---

### 🎨 Переменные для САЙТА (основной экран)

Это ключевые показатели, которые нужно показывать на главном экране сайта:

#### Температурные условия:
```javascript
probabilities: {
  very_cold: 0.05,           // "Очень холодно" (< 0°C)
  cold: 0.20,                // "Холодно" (< 10°C)
  comfortable: 0.45,         // "Комфортно" (15-25°C) ⭐ ГЛАВНОЕ
  hot: 0.25,                 // "Жарко" (> 25°C)
  very_hot: 0.05,            // "Очень жарко" (> 30°C)
  
  // 🆕 Ощущаемая температура
  comfortable_feels_like: 0.40,  // Ощущается комфортно
  hot_feels_like: 0.30,          // Ощущается жарко
  extreme_heat_feels_like: 0.05  // Экстремально жарко ощущается
}

statistics: {
  temperature: {
    mean: 18.2,              // Средняя температура ⭐ ГЛАВНОЕ
    min: 12.5,               // Минимум
    max: 27.5                // Максимум
  },
  // 🆕 Ощущаемая температура
  apparent_temperature: {
    mean: 19.5,              // Средняя ощущаемая
    min: 13.0,
    max: 28.0
  }
}
```

**Для фронтенда:**
- Показывать `statistics.temperature.mean` как основную температуру
- Показывать `statistics.apparent_temperature.mean` как "Ощущается как: XX°C" 🆕
- Цветовая индикация по вероятностям: comfortable (зелёный), hot (оранжевый), very_hot (красный)

#### Осадки:
```javascript
probabilities: {
  very_wet: 0.05,            // Очень влажно (> 100 мм) ⭐ ГЛАВНОЕ
  moderate_rain: 0.25,       // Умеренный дождь (10-50 мм)
  light_rain: 0.35           // Легкий дождь (2.5-10 мм)
}

statistics: {
  precipitation: {
    mean: 9.5,               // Средние осадки ⭐ ГЛАВНОЕ
    max: 45.2,               // Максимум за день
    percentile_90: 28.0      // 90% дней < этого значения
  }
}
```

**Для фронтенда:**
- Показывать `statistics.precipitation.mean` + "mm/день"
- Иконка зонтика если `very_wet > 0.1` или `moderate_rain > 0.3`

#### Ветер:
```javascript
probabilities: {
  very_windy: 0.02,          // Очень ветрено (> 20 м/с) ⭐ ГЛАВНОЕ
  strong_wind: 0.08,         // Сильный ветер (15-20 м/с)
  calm: 0.15,                // Штиль (< 2 м/с)
  
  // 🆕 Порывы ветра
  storm_gusts: 0.02,         // Штормовые порывы (> 25 м/с) ⚠️
  very_strong_gusts: 0.05,   // Очень сильные порывы (20-25 м/с)
  strong_gusts: 0.10         // Сильные порывы (15-20 м/с)
}

statistics: {
  wind: {
    mean: 2.6,               // Средний ветер ⭐ ГЛАВНОЕ
    max: 8.5,
    percentile_90: 4.2
  },
  // 🆕 Порывы ветра
  wind_gusts: {
    mean: 7.5,               // Средние порывы
    max: 17.2,               // Максимальные порывы ⚠️
    percentile_90: 11.0
  }
}
```

**Для фронтенда:**
- Показывать `statistics.wind.mean` как основной ветер
- **ВАЖНО:** Если `statistics.wind_gusts.max > 15`, показать предупреждение "Возможны сильные порывы до XX м/с" 🆕

#### Комфорт и качество:
```javascript
probabilities: {
  very_uncomfortable: 0.05,  // Очень некомфортно ⭐ ГЛАВНОЕ
  
  // 🆕 Качество воздуха
  air_quality_excellent: 0.40,   // Отличное
  air_quality_good: 0.35,        // Хорошее
  air_quality_poor: 0.15,        // Плохое ⚠️
  air_quality_hazardous: 0.02    // Опасное ⚠️⚠️
}

statistics: {
  // 🆕 Качество воздуха
  air_quality: {
    aod_mean: 0.18,          // Средний AOD
    aod_max: 0.30,           // Максимум
    level: "moderate"        // Уровень: excellent/good/moderate/poor/very_poor/hazardous
  }
}
```

**Для фронтенда:**
- Если `air_quality_poor > 0.2` или `air_quality_hazardous > 0.05`: показать предупреждение "Возможно плохое качество воздуха" 🆕
- Цвет по `statistics.air_quality.level`: excellent (зелёный), moderate (желтый), poor (красный)

#### Погодные условия:
```javascript
probabilities: {
  // 🆕 Коды погоды WMO
  weather_clear: 0.30,       // Ясно (коды 0-1)
  weather_cloudy: 0.40,      // Облачно (коды 2-3)
  weather_rain: 0.20,        // Дождь (коды 61-82)
  weather_snow: 0.05,        // Снег (коды 71-86)
  weather_thunderstorm: 0.03, // Гроза (коды 95-99) ⚠️
  weather_fog: 0.02          // Туман (коды 45-48)
}

statistics: {
  // 🆕 Код погоды
  weather_code: {
    most_common: 3,          // Самый частый код
    description: "Пасмурно", // Описание
    category: "cloudy"       // Категория
  },
  
  // 🆕 Риск грозы
  thunderstorm: {
    cape_mean: 1500,         // Средний CAPE
    cape_max: 3200,          // Максимум
    risk_level: "moderate"   // none/very_low/low/moderate/high/very_high/extreme
  }
}
```

**Для фронтенда:**
- Показывать иконку погоды по `statistics.weather_code.category` 🆕
- Если `weather_thunderstorm > 0.1` или `statistics.thunderstorm.risk_level` >= "high": показать ⚡ "Возможна гроза" 🆕

---

### 🔍 Переменные для раздела "ПОДРОБНЕЕ"

Это детальная информация, которую можно показывать в развернутом виде или в отдельной вкладке:

#### Детальная температура:
```javascript
statistics: {
  temperature: {
    mean: 18.2,
    min: 12.5,
    max: 27.5,
    std: 3.8,                // Стандартное отклонение
    percentile_10: 14.2,     // 10% дней холоднее
    percentile_90: 23.5      // 90% дней холоднее
  },
  dew_point: {               // Точка росы
    mean: 12.5,
    min: 8.0,
    max: 18.0
  }
}
```

#### Детальная облачность и солнце:
```javascript
probabilities: {
  clear: 0.30,               // < 25% облачности
  partly_cloudy: 0.40,       // 25-50%
  mostly_cloudy: 0.20,       // 50-75%
  overcast: 0.10             // > 90%
}

statistics: {
  cloudiness: {
    mean: 45.2,              // Средняя облачность %
    min: 10.0,
    max: 95.0
  },
  solar_radiation: {
    mean: 5.8,               // кВт-ч/м²/день
    max: 8.2
  }
}
```

#### Детальный UV индекс:
```javascript
probabilities: {
  low_uv: 0.15,              // < 2 (безопасно)
  moderate_uv: 0.40,         // 2-5 (умеренно)
  high_uv: 0.30,             // 5-7 (высокий)
  very_high_uv: 0.10,        // 7-10 (очень высокий)
  extreme_uv: 0.05           // > 11 (экстремальный)
}

statistics: {
  uv_index: {
    mean: 4.5,
    max: 8.2,
    percentile_90: 6.8
  }
}
```

#### Атмосферное давление:
```javascript
probabilities: {
  very_low_pressure: 0.05,   // < 98 кПа (циклон)
  low_pressure: 0.20,         // 98-100 кПа
  normal_pressure: 0.50,      // 100-103 кПа
  high_pressure: 0.20,        // 103-104.5 кПа
  very_high_pressure: 0.05    // > 104.5 кПа (антициклон)
}

statistics: {
  pressure: {
    mean: 101.3,             // кПа
    min: 98.5,
    max: 104.2,
    std: 1.8
  }
}
```

#### Снег (зимой):
```javascript
probabilities: {
  no_snow: 0.70,             // 0 см
  light_snow: 0.15,          // 0-5 см
  moderate_snow: 0.10,       // 5-15 см
  heavy_snow: 0.04,          // 15-30 см
  very_heavy_snow: 0.01      // > 50 см
}

statistics: {
  snow: {
    mean: 2.5,               // Средняя глубина
    max: 15.0,               // Максимум
    days_with_snow: 5        // Дней со снегом
  }
}
```

#### Загрязнение воздуха (детально):
```javascript
probabilities: {
  // Черный углерод
  black_carbon_clean: 0.50,  // < 0.5 μg/m³
  black_carbon_low: 0.30,    // 0.5-2 μg/m³
  black_carbon_high: 0.10,   // > 10 μg/m³
  
  // Пыль
  dust_minimal: 0.60,        // < 10 μg/m³
  dust_low: 0.25,            // 10-50 μg/m³
  dust_high: 0.10,           // 150-250 μg/m³
  dust_storm: 0.02           // > 500 μg/m³ (песчаная буря!)
}

statistics: {
  black_carbon: {
    mean: 2.5,               // μg/m³
    max: 8.5,
    percentile_90: 5.2
  },
  dust: {
    mean: 15.0,              // μg/m³
    max: 85.0,
    percentile_90: 35.0
  }
}
```

#### Грозовая активность (детально):
```javascript
probabilities: {
  thunderstorm_none: 0.60,        // CAPE < 300
  thunderstorm_very_low: 0.20,    // 300-1000
  thunderstorm_low: 0.10,         // 1000-1500
  thunderstorm_moderate: 0.05,    // 1500-2500
  thunderstorm_high: 0.03,        // 2500-3500 ⚡
  thunderstorm_very_high: 0.01,   // 3500-5000 ⚡⚡
  thunderstorm_extreme: 0.01      // > 5000 ⚡⚡⚡ (торнадо!)
}
```

---

### 🔄 Мультисорсные данные (при use_multi_source=True)

Когда включен мультисорсный режим, каждый параметр дополняется информацией о консенсусе:

```javascript
{
  "temperature": {
    // Обычные поля
    "mean": 18.2,
    "min": 12.5,
    "max": 27.5,
    
    // 🆕 Мультисорсные поля
    "consensus": {
      "value": 18.5,                          // Консенсусное значение
      "confidence": "high",                   // high/medium/low/very_low
      "confidence_interval": [17.8, 19.2],    // Доверительный интервал
      "sources_used": ["NASA_POWER", "OpenMeteo", "OpenMeteo_Enhanced"],
      "agreement_level": 0.95,                // 95% согласованность
      "source_values": {                      // Значения по источникам
        "NASA_POWER": 18.3,
        "OpenMeteo": 18.7,
        "OpenMeteo_Enhanced": 18.5
      },
      "std_deviation": 0.2                    // Разброс между источниками
    }
  }
}
```

**Для фронтенда (мультисорсный режим):**
- Показывать `consensus.value` как основное значение
- Бейдж с `consensus.confidence`: 🟢 high / 🟡 medium / 🔴 low
- Tooltip: "Данные из X источников, согласованность YY%"
- Если `confidence === "low"`: показать предупреждение "Данные могут быть неточными"

---

## �💻 Интеграция

### Python (Flask/Django Backend)

```python
from flask import Flask, jsonify, request
from weather_analysis import analyze_weather

app = Flask(__name__)

@app.route('/weather', methods=['POST'])
def get_weather():
    data = request.json
    
    result = analyze_weather(
        latitude=data['latitude'],
        longitude=data['longitude'],
        date=data['date'],
        units=data.get('units', {
            'temperature': 'celsius',
            'wind_speed': 'ms'
        })
    )
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000)
```

### JavaScript (Frontend)

```javascript
// Запрос к API
async function getWeatherAnalysis(latitude, longitude, date) {
  const response = await fetch('http://localhost:5000/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      latitude,
      longitude,
      date,
      units: {
        temperature: 'fahrenheit',
        wind_speed: 'mph',
        precipitation: 'inches'
      }
    })
  });
  
  const data = await response.json();
  return data;
}

// Использование
getWeatherAnalysis(55.7558, 37.6173, '2026-07-15')
  .then(result => {
    console.log('Вероятность жары:', result.probabilities.very_hot);
    console.log('Средняя температура:', result.statistics.temperature.mean);
  });
```

### React Component

```jsx
import React, { useState, useEffect } from 'react';

function WeatherProbability({ latitude, longitude, date }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, date })
    })
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [latitude, longitude, date]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Weather Analysis for {data.date}</h2>
      <div>
        <h3>Probabilities:</h3>
        <ul>
          <li>Very Hot: {(data.probabilities.very_hot * 100).toFixed(1)}%</li>
          <li>Hot: {(data.probabilities.hot * 100).toFixed(1)}%</li>
          <li>Cold: {(data.probabilities.cold * 100).toFixed(1)}%</li>
        </ul>
      </div>
      <div>
        <h3>Statistics:</h3>
        <p>Average Temperature: {data.statistics.temperature.mean}°C</p>
        <p>Average Precipitation: {data.statistics.precipitation.mean} mm</p>
      </div>
    </div>
  );
}
```

---

## 📏 Единицы измерения

### Поддерживаемые единицы

```python
units = {
    'temperature': 'fahrenheit',  # 'celsius' (по умолчанию) или 'fahrenheit'
    'wind_speed': 'mph',          # 'ms' (по умолчанию), 'kmh', 'mph'
    'precipitation': 'inches',    # 'mm' (по умолчанию) или 'inches'
    'pressure': 'inhg'            # 'kpa' (по умолчанию), 'mmhg', 'inhg'
}

result = analyze_weather(
    latitude=55.7558,
    longitude=37.6173,
    date='2026-07-15',
    units=units
)
```

### Таблица конвертации

| Параметр | Единица 1 | Единица 2 | Формула |
|----------|-----------|-----------|---------|
| Температура | °C | °F | F = C × 9/5 + 32 |
| Скорость ветра | м/с | км/ч | km/h = m/s × 3.6 |
| Скорость ветра | м/с | mph | mph = m/s × 2.237 |
| Осадки | мм | inches | in = mm / 25.4 |
| Давление | кПа | мм рт.ст. | mmHg = kPa × 7.501 |
| Давление | кПа | inHg | inHg = kPa × 0.2953 |

---

## ⚠️ Обработка ошибок

### Типы ошибок

```python
from weather_analysis import analyze_weather

try:
    result = analyze_weather(
        latitude=95.0,  # Неверная широта
        longitude=37.6173,
        date='2026-07-15'
    )
except ValueError as e:
    print(f"Ошибка валидации: {e}")
    # Output: "Недопустимая широта: 95.0. Должна быть от -90 до 90"

try:
    result = analyze_weather(
        latitude=55.7558,
        longitude=37.6173,
        date='invalid-date'
    )
except ValueError as e:
    print(f"Ошибка даты: {e}")
```

### Проверка доступности API

```python
from weather_analysis import WeatherDataService

service = WeatherDataService()
sources = service.test_connection()

if sources['NASA']:
    print("✅ NASA API доступен")
else:
    print("❌ NASA API недоступен")

if sources['OpenMeteo']:
    print("✅ Open-Meteo API доступен")
else:
    print("❌ Open-Meteo API недоступен")
```

### Обработка ошибок в результате

```python
result = analyze_weather(55.7558, 37.6173, '2026-07-15')

if 'error' in result:
    print(f"Ошибка: {result['error']}")
else:
    # Обработка нормального результата
    print(f"Вероятность жары: {result['probabilities']['very_hot']}")
```

---

## 📚 Полный список возвращаемых переменных

### Вероятности (probabilities)

| Переменная | Диапазон | Описание |
|------------|----------|----------|
| `very_cold` | 0.0-1.0 | < 0°C или < 10-й перцентиль |
| `cold` | 0.0-1.0 | < 10°C или < 25-й перцентиль |
| `comfortable` | 0.0-1.0 | 15-25°C + влажность < 70% |
| `hot` | 0.0-1.0 | > 25°C или > 75-й перцентиль |
| `very_hot` | 0.0-1.0 | > 30°C или > 90-й перцентиль |
| `very_wet` | 0.0-1.0 | > 100 мм/день осадков |
| `very_windy` | 0.0-1.0 | > 20 м/с ветер |
| `strong_wind` | 0.0-1.0 | 15-20 м/с |
| `moderate_wind` | 0.0-1.0 | 10-15 м/с |
| `calm` | 0.0-1.0 | < 2 м/с (штиль) |
| `very_uncomfortable` | 0.0-1.0 | Heat index > 40°C |
| `uncomfortable_hot` | 0.0-1.0 | Жарко + влажно |
| `clear` | 0.0-1.0 | < 25% облачности |
| `partly_cloudy` | 0.0-1.0 | 25-50% облачности |
| `mostly_cloudy` | 0.0-1.0 | 50-75% облачности |
| `overcast` | 0.0-1.0 | > 90% облачности |
| `low_uv` | 0.0-1.0 | UV индекс < 2 |
| `moderate_uv` | 0.0-1.0 | UV индекс 2-5 |
| `high_uv` | 0.0-1.0 | UV индекс 5-7 |
| `very_high_uv` | 0.0-1.0 | UV индекс 7-10 |
| `extreme_uv` | 0.0-1.0 | UV индекс > 11 |
| `very_low_pressure` | 0.0-1.0 | < 98 кПа |
| `low_pressure` | 0.0-1.0 | 98-100 кПа |
| `normal_pressure` | 0.0-1.0 | 100-103 кПа |
| `high_pressure` | 0.0-1.0 | 103-104.5 кПа |
| `very_high_pressure` | 0.0-1.0 | > 104.5 кПа |
| `no_snow` | 0.0-1.0 | 0 см снега |
| `light_snow` | 0.0-1.0 | 0-5 см |
| `moderate_snow` | 0.0-1.0 | 5-15 см |
| `heavy_snow` | 0.0-1.0 | 15-30 см |
| `very_heavy_snow` | 0.0-1.0 | > 50 см |

### Статистика (statistics)

Все значения - числа (`float`), кроме указанных

| Переменная | Единица | Описание |
|------------|---------|----------|
| `temperature.mean` | °C | Средняя температура |
| `temperature.min` | °C | Минимальная |
| `temperature.max` | °C | Максимальная |
| `temperature.std` | °C | Стандартное отклонение |
| `temperature.percentile_10` | °C | 10-й перцентиль |
| `temperature.percentile_90` | °C | 90-й перцентиль |
| `dew_point.mean` | °C | Точка росы средняя |
| `dew_point.min` | °C | Точка росы минимум |
| `dew_point.max` | °C | Точка росы максимум |
| `precipitation.mean` | мм | Средние осадки в день |
| `precipitation.max` | мм | Максимум осадков |
| `precipitation.std` | мм | Стандартное отклонение |
| `precipitation.percentile_90` | мм | 90-й перцентиль |
| `wind.mean` | м/с | Средняя скорость (2м) |
| `wind.max` | м/с | Максимум |
| `wind.std` | м/с | Стандартное отклонение |
| `wind.percentile_90` | м/с | 90-й перцентиль |
| `wind_10m.mean` | м/с | Скорость на 10м |
| `wind_10m.max` | м/с | Максимум на 10м |
| `humidity.mean` | % | Средняя влажность |
| `humidity.min` | % | Минимум |
| `humidity.max` | % | Максимум |
| `humidity.std` | % | Стандартное отклонение |
| `cloudiness.mean` | % | Средняя облачность |
| `cloudiness.min` | % | Минимум |
| `cloudiness.max` | % | Максимум |
| `uv_index.mean` | index | Средний UV индекс |
| `uv_index.max` | index | Максимум |
| `solar_radiation.mean` | кВт-ч/м²/день | Солнечная радиация |
| `solar_radiation.max` | кВт-ч/м²/день | Максимум |
| `pressure.mean` | кПа | Среднее давление |
| `pressure.min` | кПа | Минимум |
| `pressure.max` | кПа | Максимум |
| `pressure.std` | кПа | Стандартное отклонение |
| `snow_depth.mean` | см | Средняя глубина снега |
| `snow_depth.max` | см | Максимум |

---

## 🎯 Советы по использованию

### Для фронтенд разработчиков

1. **Всегда проверяйте наличие данных:**
```javascript
if (result.statistics && result.statistics.temperature) {
  const temp = result.statistics.temperature.mean;
}
```

2. **Используйте вероятности для визуализации:**
```javascript
// Круговая диаграмма температурных условий
const tempData = {
  labels: ['Очень холодно', 'Холодно', 'Комфортно', 'Жарко', 'Очень жарко'],
  values: [
    result.probabilities.very_cold * 100,
    result.probabilities.cold * 100,
    result.probabilities.comfortable * 100,
    result.probabilities.hot * 100,
    result.probabilities.very_hot * 100
  ]
};
```

3. **Обрабатывайте единицы измерения:**
```javascript
const unit = result.statistics.temperature.unit || '°C';
const temp = result.statistics.temperature.mean;
const display = `${temp.toFixed(1)}${unit}`;
```

### Для бэкенд разработчиков

1. **Кешируйте результаты:** API уже кеширует данные NASA, но можно кешировать и финальные результаты
2. **Используйте асинхронность:** Запросы к API могут занимать 3-5 секунд
3. **Обрабатывайте таймауты:** Установите timeout 30 секунд для запросов

### Оптимизация

1. **Batch requests:** Используйте `analyze_weather_range()` вместо множества `analyze_weather()`
2. **Выбор периода:** Минимум 10 лет данных рекомендуется для надежной статистики
3. **Интерполяция:** Включена по умолчанию для точности ~100м

---

## 📞 Поддержка

Если есть вопросы по интеграции:
1. Проверьте примеры в `/examples/example_usage.py`
2. Запустите тесты: `python -m pytest tests/`
3. Проверьте логи API

---

## 📄 Лицензия

MIT License - используйте свободно для хакатона и проектов

---

**Версия:** 2.0.0  
**Последнее обновление:** 2025-10-04  
**Автор:** NASA Hackathon Team - Mentorium - Ilian