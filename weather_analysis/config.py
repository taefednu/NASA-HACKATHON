"""
Конфигурация для анализа погодных условий
Содержит пороговые значения и настройки
"""

class WeatherConfig:
    """Конфигурация порогов для разных погодных условий"""
    
    # === ТЕМПЕРАТУРНЫЕ ПОРОГИ (°C) ===
    # Используем относительные пороги (перцентили) + абсолютные пороги
    
    TEMPERATURE_THRESHOLDS = {
        'very_cold': {
            'percentile': 10,  # 10-й перцентиль для локации
            'absolute_min': -10  # Абсолютный минимум (для любого региона)
        },
        'cold': {
            'percentile': 25,
            'absolute_max': 10
        },
        'hot': {
            'percentile': 75,
            'absolute_min': 25
        },
        'very_hot': {
            'percentile': 90,  # 90-й перцентиль для локации
            'absolute_min': 30  # Абсолютный минимум (для жарких регионов выше)
        }
    }
    
    # === ОСАДКИ (mm/день) ===
    PRECIPITATION_THRESHOLDS = {
        'very_dry': 0.1,      # Почти нет осадков
        'light_rain': 2.5,    # Легкий дождь
        'moderate_rain': 10,  # Умеренный дождь
        'heavy_rain': 50,     # Сильный дождь
        'very_wet': 100       # Очень сильные осадки
    }
    
    # === ВЕТЕР (m/s) ===
    WIND_THRESHOLDS = {
        'calm': 2,           # Штиль
        'light_breeze': 5,   # Легкий ветер
        'moderate_wind': 10, # Умеренный ветер
        'strong_wind': 15,   # Сильный ветер
        'very_windy': 20     # Очень ветрено (шторм)
    }
    
    # === ВЛАЖНОСТЬ (%) ===
    HUMIDITY_THRESHOLDS = {
        'very_dry': 30,
        'comfortable': 60,
        'humid': 80,
        'very_humid': 90
    }
    
    # === ОБЛАЧНОСТЬ (%) ===
    CLOUD_THRESHOLDS = {
        'clear': 25,        # Ясно
        'partly_cloudy': 50,  # Переменная облачность
        'mostly_cloudy': 75,  # Облачно
        'overcast': 90      # Пасмурно
    }
    
    # === UV ИНДЕКС ===
    UV_THRESHOLDS = {
        'low': 2,           # Низкий
        'moderate': 5,      # Умеренный
        'high': 7,          # Высокий
        'very_high': 10,    # Очень высокий
        'extreme': 11       # Экстремальный
    }
    
    # === АТМОСФЕРНОЕ ДАВЛЕНИЕ (кПа) ===
    PRESSURE_THRESHOLDS = {
        'very_low': 98.0,   # Сильный циклон
        'low': 100.0,       # Низкое (дождь вероятен)
        'normal': 101.3,    # Нормальное
        'high': 103.0,      # Высокое (ясная погода)
        'very_high': 104.5  # Антициклон
    }
    
    # === СНЕГ (см) ===
    SNOW_THRESHOLDS = {
        'no_snow': 0,
        'light_snow': 5,     # Легкий снег
        'moderate_snow': 15,  # Умеренный снег
        'heavy_snow': 30,     # Сильный снег
        'very_heavy_snow': 50 # Очень сильный снег
    }
    
    # === ВИДИМОСТЬ (км) ===
    VISIBILITY_THRESHOLDS = {
        'very_poor': 1,      # Туман
        'poor': 4,           # Плохая
        'moderate': 10,      # Умеренная
        'good': 20,          # Хорошая
        'excellent': 50      # Отличная
    }
    
    # === ОЩУЩАЕМАЯ ТЕМПЕРАТУРА (°C) ===
    # Учитывает ветер, влажность, солнечную радиацию
    APPARENT_TEMPERATURE_THRESHOLDS = {
        'extreme_cold': -20,   # Экстремально холодно (опасно)
        'very_cold': -10,      # Очень холодно
        'cold': 0,             # Холодно
        'cool': 10,            # Прохладно
        'comfortable': (15, 25),  # Комфортно
        'warm': 27,            # Тепло
        'hot': 32,             # Жарко
        'very_hot': 38,        # Очень жарко
        'extreme_heat': 43     # Экстремальная жара (опасно)
    }
    
    # === ПОРЫВЫ ВЕТРА (m/s) ===
    WIND_GUST_THRESHOLDS = {
        'calm': 5,              # Слабые порывы
        'moderate': 10,         # Умеренные порывы
        'strong': 15,           # Сильные порывы (осторожность)
        'very_strong': 20,      # Очень сильные (опасно)
        'storm': 25,            # Штормовые порывы (очень опасно)
        'hurricane': 33         # Ураганные порывы (критично)
    }
    
    # === КОДЫ ПОГОДЫ (WMO Weather Code) ===
    # https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
    WEATHER_CODE_DESCRIPTION = {
        0: 'Ясно',
        1: 'Преимущественно ясно',
        2: 'Переменная облачность',
        3: 'Пасмурно',
        45: 'Туман',
        48: 'Изморозь',
        51: 'Легкая морось',
        53: 'Умеренная морось',
        55: 'Сильная морось',
        56: 'Ледяная морось (слабая)',
        57: 'Ледяная морось (сильная)',
        61: 'Слабый дождь',
        63: 'Умеренный дождь',
        65: 'Сильный дождь',
        66: 'Ледяной дождь (слабый)',
        67: 'Ледяной дождь (сильный)',
        71: 'Слабый снег',
        73: 'Умеренный снег',
        75: 'Сильный снег',
        77: 'Снежные зерна',
        80: 'Слабые ливни',
        81: 'Умеренные ливни',
        82: 'Сильные ливни',
        85: 'Слабые снежные ливни',
        86: 'Сильные снежные ливни',
        95: 'Гроза',
        96: 'Гроза с легким градом',
        99: 'Гроза с сильным градом'
    }
    
    WEATHER_CODE_CATEGORIES = {
        'clear': [0, 1],
        'cloudy': [2, 3],
        'fog': [45, 48],
        'drizzle': [51, 53, 55, 56, 57],
        'rain': [61, 63, 65, 66, 67, 80, 81, 82],
        'snow': [71, 73, 75, 77, 85, 86],
        'thunderstorm': [95, 96, 99]
    }
    
    # === КАЧЕСТВО ВОЗДУХА (AOD - Aerosol Optical Depth) ===
    AIR_QUALITY_THRESHOLDS = {
        'excellent': 0.05,      # Отличное (чистый воздух)
        'good': 0.15,           # Хорошее
        'moderate': 0.35,       # Умеренное
        'poor': 0.65,           # Плохое
        'very_poor': 1.0,       # Очень плохое
        'hazardous': 2.0        # Опасное (смог, дым от пожаров)
    }
    
    # === ПЫЛЬ В АТМОСФЕРЕ (μg/m³) ===
    DUST_THRESHOLDS = {
        'minimal': 10,          # Минимальная концентрация
        'low': 50,              # Низкая
        'moderate': 150,        # Умеренная
        'high': 250,            # Высокая (песчаная буря)
        'very_high': 500,       # Очень высокая (опасно)
        'extreme': 1000         # Экстремальная (критично)
    }
    
    # === ЧЕРНЫЙ УГЛЕРОД (μg/m³) ===
    BLACK_CARBON_THRESHOLDS = {
        'clean': 0.5,           # Чистый воздух
        'low': 2,               # Низкое загрязнение
        'moderate': 5,          # Умеренное
        'high': 10,             # Высокое (транспорт, промышленность)
        'very_high': 20,        # Очень высокое
        'extreme': 50           # Экстремальное (опасно для здоровья)
    }
    
    # === ВЕРОЯТНОСТЬ ГРОЗЫ (CAPE - J/kg) ===
    THUNDERSTORM_THRESHOLDS = {
        'none': 0,              # Гроза невозможна
        'very_low': 300,        # Очень низкая вероятность
        'low': 1000,            # Низкая вероятность
        'moderate': 1500,       # Умеренная вероятность
        'high': 2500,           # Высокая вероятность (возможны грозы)
        'very_high': 3500,      # Очень высокая (сильные грозы)
        'extreme': 5000         # Экстремальная (суперячейки, торнадо)
    }
    
    # === ИНДЕКС КОМФОРТА (Heat Index) ===
    # Учитывает температуру + влажность
    COMFORT_INDEX = {
        'comfortable': {
            'temp_range': (15, 25),  # °C
            'humidity_max': 70
        },
        'uncomfortable_hot': {
            'temp_min': 27,
            'humidity_min': 40  # Жарко + влажно = дискомфорт
        },
        'uncomfortable_cold': {
            'temp_max': 5,
            'wind_min': 5  # Холодно + ветер = дискомфорт
        },
        'very_uncomfortable': {
            'heat_index_min': 40  # Heat index > 40°C = опасно
        }
    }
    
    # === ПАРАМЕТРЫ ДАННЫХ NASA ===
    # Полный список параметров NASA POWER API
    NASA_PARAMETERS = {
        # Температура
        'T2M': 'Температура на высоте 2м (°C)',
        'T2M_MAX': 'Максимальная температура (°C)',
        'T2M_MIN': 'Минимальная температура (°C)',
        'T2MDEW': 'Точка росы на высоте 2м (°C)',
        'T2MWET': 'Температура влажного термометра (°C)',
        
        # Осадки
        'PRECTOTCORR': 'Осадки скорректированные (мм/день)',
        'PRECTOTCORR_SUM': 'Сумма осадков (мм)',
        
        # Ветер
        'WS2M': 'Скорость ветра на высоте 2м (м/с)',
        'WS10M': 'Скорость ветра на высоте 10м (м/с)',
        'WS50M': 'Скорость ветра на высоте 50м (м/с)',
        'WD2M': 'Направление ветра на высоте 2м (градусы)',
        'WD10M': 'Направление ветра на высоте 10м (градусы)',
        
        # Влажность
        'RH2M': 'Относительная влажность на 2м (%)',
        'QV2M': 'Удельная влажность на 2м (кг вода/кг воздуха)',
        
        # Атмосферное давление
        'PS': 'Давление на поверхности (кПа)',
        'PSC': 'Давление скорректированное (кПа)',
        
        # Облачность и солнечная радиация
        'CLOUD_AMT': 'Облачность (%)',
        'ALLSKY_SFC_SW_DWN': 'Солнечная радиация (все небо) (кВт-ч/м²/день)',
        'CLRSKY_SFC_SW_DWN': 'Солнечная радиация (ясное небо) (кВт-ч/м²/день)',
        'ALLSKY_SFC_UV_INDEX': 'UV индекс (все небо)',
        'CLRSKY_SFC_UV_INDEX': 'UV индекс (ясное небо)',
        
        # Снег (для зимних месяцев)
        'SNODP': 'Глубина снежного покрова (см)',
        
        # Видимость
        'VISIBILITY': 'Видимость (км)',
        
        # Испарение
        'EVPTRNS': 'Испарение/транспирация (мм/день)',
    }
    
    # Базовые параметры (всегда запрашиваем)
    NASA_PARAMETERS_BASIC = [
        'T2M', 'T2M_MAX', 'T2M_MIN', 'T2MDEW',
        'PRECTOTCORR', 'WS2M', 'WS10M', 'RH2M', 
        'PS', 'CLOUD_AMT', 'ALLSKY_SFC_SW_DWN'
    ]
    
    # Дополнительные параметры (по запросу)
    NASA_PARAMETERS_EXTENDED = [
        'T2MWET', 'WS50M', 'WD2M', 'WD10M', 'QV2M', 'PSC',
        'CLRSKY_SFC_SW_DWN', 'ALLSKY_SFC_UV_INDEX', 'CLRSKY_SFC_UV_INDEX',
        'SNODP', 'EVPTRNS'
    ]
    
    # === ПАРАМЕТРЫ OPEN-METEO API ===
    OPENMETEO_PARAMETERS = {
        # Температура
        'temperature_2m': 'Температура на 2м (°C)',
        'apparent_temperature': 'Ощущаемая температура (°C)',
        'temperature_2m_max': 'Макс температура (°C)',
        'temperature_2m_min': 'Мин температура (°C)',
        
        # Осадки
        'precipitation_sum': 'Сумма осадков (мм)',
        'rain_sum': 'Только дождь (мм)',
        'snowfall_sum': 'Снегопад (см)',
        
        # Ветер
        'windspeed_10m_max': 'Макс скорость ветра (м/с)',
        'windgusts_10m_max': 'Макс порывы ветра (м/с)',
        'winddirection_10m_dominant': 'Преобладающее направление ветра (°)',
        
        # Другое
        'weathercode': 'Код погоды (WMO)',
        'sunshine_duration': 'Продолжительность солнечного сияния (сек)',
        'relativehumidity_2m_mean': 'Средняя влажность (%)',
        'dewpoint_2m_mean': 'Средняя точка росы (°C)',
        'surface_pressure_mean': 'Среднее давление (гПа)',
        'shortwave_radiation_sum': 'Солнечная радиация (МДж/м²)',
    }
    
    # === ПАРАМЕТРЫ GES DISC (NASA Earth Data) ===
    GES_DISC_PARAMETERS = {
        # Аэрозоли и качество воздуха
        'AODANA': 'Оптическая толщина аэрозоля (безразмерная)',
        'BCSMASS': 'Черный углерод (μg/m³)',
        'DUSMASS': 'Пыль (μg/m³)',
        'SO2SMASS': 'Диоксид серы (μg/m³)',
        'SO4SMASS': 'Сульфаты (μg/m³)',
        'SSSMASS': 'Морская соль (μg/m³)',
        
        # Озон
        'TO3': 'Общий озон (единицы Добсона)',
        'TROPO3': 'Тропосферный озон (единицы Добсона)',
        
        # Облачность
        'CLDTOT': 'Общая облачность (%)',
        'CLDLOW': 'Низкая облачность (%)',
        'CLDMID': 'Средняя облачность (%)',
        'CLDHGH': 'Высокая облачность (%)',
    }
    
    # === ПАРАМЕТРЫ CPTEC (Brazilian Weather) ===
    CPTEC_PARAMETERS = {
        'cape': 'CAPE - энергия конвекции (J/kg)',
        'cin': 'CIN - конвективное торможение (J/kg)',
        'lifted_index': 'Индекс неустойчивости атмосферы (°C)',
    }
    
    # === НАСТРОЙКИ АНАЛИЗА ===
    ANALYSIS_CONFIG = {
        'min_years_data': 10,  # Минимум лет для надежной статистики
        'default_years': 30,   # По умолчанию берем 30 лет
        'cache_enabled': True,
        'cache_ttl_days': 30   # Кэш на 30 дней
    }
    
    # === МУЛЬТИСОРСНЫЙ ПОДХОД ===
    DATA_SOURCES = {
        'nasa_power': {
            'name': 'NASA POWER',
            'priority': 1,          # Приоритет (1 = высший)
            'reliability': 0.95,    # Надежность источника (0-1)
            'coverage': 'global',   # Покрытие
            'parameters': 'NASA_PARAMETERS'
        },
        'openmeteo': {
            'name': 'Open-Meteo',
            'priority': 2,
            'reliability': 0.90,
            'coverage': 'global',
            'parameters': 'OPENMETEO_PARAMETERS'
        },
        'ges_disc': {
            'name': 'GES DISC',
            'priority': 1,
            'reliability': 0.95,
            'coverage': 'global',
            'parameters': 'GES_DISC_PARAMETERS'
        },
        'cptec': {
            'name': 'Brazilian CPTEC',
            'priority': 3,
            'reliability': 0.85,
            'coverage': 'south_america',  # Только Южная Америка
            'parameters': 'CPTEC_PARAMETERS'
        }
    }
    
    # Настройки консенсус-анализа
    CONSENSUS_CONFIG = {
        'min_sources': 2,           # Минимум источников для консенсуса
        'outlier_threshold': 0.20,  # 20% отклонение = outlier
        'confidence_levels': {
            'high': 0.90,           # >90% согласованность
            'medium': 0.75,         # >75% согласованность
            'low': 0.50             # >50% согласованность
        }
    }
    
    # === КАТЕГОРИИ ДЛЯ ВЫВОДА ===
    WEATHER_CATEGORIES = [
        'very_cold',
        'cold', 
        'comfortable',
        'hot',
        'very_hot',
        'very_wet',
        'very_windy',
        'very_uncomfortable',
        # Новые категории
        'extreme_heat',         # Экстремальная жара
        'extreme_cold',         # Экстремальный холод
        'storm_warning',        # Предупреждение о шторме
        'air_quality_poor',     # Плохое качество воздуха
        'thunderstorm_likely',  # Вероятна гроза
        'dust_storm',           # Пыльная буря
        'high_pollution'        # Высокое загрязнение
    ]
    
    @staticmethod
    def calculate_heat_index(temperature_c, humidity_percent):
        """
        Рассчитать Heat Index (индекс жары)
        Учитывает как температуру, так и влажность
        
        Args:
            temperature_c: Температура в градусах Цельсия
            humidity_percent: Относительная влажность в процентах
            
        Returns:
            Heat index в градусах Цельсия
        """
        # Конвертируем в Фаренгейты для формулы
        T = temperature_c * 9/5 + 32
        RH = humidity_percent
        
        # Упрощенная формула Heat Index (работает при T > 80°F)
        if T < 80:
            return temperature_c
        
        HI = -42.379 + 2.04901523*T + 10.14333127*RH - 0.22475541*T*RH
        HI += -0.00683783*T*T - 0.05481717*RH*RH + 0.00122874*T*T*RH
        HI += 0.00085282*T*RH*RH - 0.00000199*T*T*RH*RH
        
        # Конвертируем обратно в Цельсий
        return (HI - 32) * 5/9
    
    @staticmethod
    def calculate_wind_chill(temperature_c, wind_speed_ms):
        """
        Рассчитать Wind Chill (ощущаемая температура с учетом ветра)
        
        Args:
            temperature_c: Температура в градусах Цельсия
            wind_speed_ms: Скорость ветра в м/с
            
        Returns:
            Wind chill в градусах Цельсия
        """
        # Конвертируем скорость ветра в км/ч
        V = wind_speed_ms * 3.6
        T = temperature_c
        
        # Формула работает при T <= 10°C и V >= 4.8 км/ч
        if T > 10 or V < 4.8:
            return temperature_c
        
        # Формула Wind Chill
        WC = 13.12 + 0.6215*T - 11.37*(V**0.16) + 0.3965*T*(V**0.16)
        
        return WC
    
    @staticmethod
    def calculate_apparent_temperature(temperature_c, humidity_percent, wind_speed_ms, solar_radiation=None):
        """
        Рассчитать ощущаемую температуру (apparent temperature)
        Учитывает температуру, влажность, ветер и опционально солнечную радиацию
        
        Args:
            temperature_c: Температура в °C
            humidity_percent: Относительная влажность в %
            wind_speed_ms: Скорость ветра в м/с
            solar_radiation: Солнечная радиация в Вт/м² (опционально)
            
        Returns:
            Ощущаемая температура в °C
        """
        T = temperature_c
        RH = humidity_percent
        V = wind_speed_ms
        
        # Для холодной погоды используем Wind Chill
        if T <= 10:
            return WeatherConfig.calculate_wind_chill(T, V)
        
        # Для жаркой погоды используем Heat Index
        if T >= 27:
            return WeatherConfig.calculate_heat_index(T, RH)
        
        # Для умеренной погоды - упрощенная формула
        # Учитываем влияние ветра и влажности
        wind_effect = -2.0 * (V ** 0.5)  # Ветер охлаждает
        humidity_effect = 0.0
        
        if RH > 70:
            humidity_effect = (RH - 70) * 0.05  # Высокая влажность повышает ощущение жары
        
        apparent = T + wind_effect + humidity_effect
        
        return apparent
    
    @staticmethod
    def get_weather_code_category(weather_code):
        """
        Определить категорию погоды по коду WMO
        
        Args:
            weather_code: Код погоды WMO (0-99)
            
        Returns:
            Категория погоды: 'clear', 'cloudy', 'rain', 'snow', 'thunderstorm', 'fog'
        """
        for category, codes in WeatherConfig.WEATHER_CODE_CATEGORIES.items():
            if weather_code in codes:
                return category
        return 'unknown'
    
    @staticmethod
    def get_air_quality_level(aod_value):
        """
        Определить уровень качества воздуха по AOD
        
        Args:
            aod_value: Оптическая толщина аэрозоля (AOD)
            
        Returns:
            Уровень качества: 'excellent', 'good', 'moderate', 'poor', 'very_poor', 'hazardous'
        """
        thresholds = WeatherConfig.AIR_QUALITY_THRESHOLDS
        
        if aod_value < thresholds['excellent']:
            return 'excellent'
        elif aod_value < thresholds['good']:
            return 'good'
        elif aod_value < thresholds['moderate']:
            return 'moderate'
        elif aod_value < thresholds['poor']:
            return 'poor'
        elif aod_value < thresholds['very_poor']:
            return 'very_poor'
        else:
            return 'hazardous'
    
    @staticmethod
    def get_thunderstorm_risk(cape_value):
        """
        Определить риск грозы по значению CAPE
        
        Args:
            cape_value: CAPE в J/kg
            
        Returns:
            Уровень риска: 'none', 'very_low', 'low', 'moderate', 'high', 'very_high', 'extreme'
        """
        thresholds = WeatherConfig.THUNDERSTORM_THRESHOLDS
        
        if cape_value < thresholds['very_low']:
            return 'none'
        elif cape_value < thresholds['low']:
            return 'very_low'
        elif cape_value < thresholds['moderate']:
            return 'low'
        elif cape_value < thresholds['high']:
            return 'moderate'
        elif cape_value < thresholds['very_high']:
            return 'high'
        elif cape_value < thresholds['extreme']:
            return 'very_high'
        else:
            return 'extreme'
    
    @staticmethod
    def get_weather_description(weather_code):
        """
        Получить описание погоды по коду WMO
        
        Args:
            weather_code: Код погоды WMO (0-99)
            
        Returns:
            Dict с description и category
        """
        description = WeatherConfig.WEATHER_CODE_DESCRIPTION.get(
            weather_code, 
            'Неизвестные условия'
        )
        category = WeatherConfig.get_weather_code_category(weather_code)
        
        return {
            'code': weather_code,
            'description': description,
            'category': category
        }


# Для удобства импорта создаем экземпляр
config = WeatherConfig()
