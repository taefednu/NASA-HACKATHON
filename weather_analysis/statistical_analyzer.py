"""
Статистический анализ погодных данных v2.0
Расчет вероятностей различных погодных условий

🆕 v2.0 Новые методы анализа:
    - _analyze_apparent_temperature() - ощущаемая температура (7 категорий)
    - _analyze_weather_conditions() - коды погоды WMO (6 категорий)
    - _analyze_wind_gusts() - порывы ветра (6 категорий от штиля до урагана)
    - _analyze_air_quality() - качество воздуха (AOD, черный углерод, пыль)
    - _analyze_thunderstorm_risk() - риск грозы по CAPE (7 уровней)

Всего: 13 методов анализа, 30+ вероятностей, 20+ статистик
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from .config import WeatherConfig


class StatisticalAnalyzer:
    """
    Анализатор для расчета вероятностей погодных условий
    на основе исторических данных
    """
    
    def __init__(self, config: WeatherConfig = None):
        self.config = config or WeatherConfig()
    
    def analyze_day(self, data: pd.DataFrame, day_of_year: int, 
                    latitude: float = None) -> Dict:
        """
        Анализировать погодные условия для конкретного дня года
        
        Args:
            data: DataFrame с историческими данными (должен содержать day_of_year)
            day_of_year: День года (1-365)
            latitude: Широта (опционально, для корректировки порогов)
            
        Returns:
            Словарь с вероятностями и статистикой
        """
        # Фильтруем данные для этого дня
        day_data = data[data['day_of_year'] == day_of_year].copy()
        
        if len(day_data) == 0:
            return {
                'error': f'Нет данных для дня {day_of_year}',
                'day_of_year': day_of_year
            }
        
        # Рассчитываем вероятности
        probabilities = {}
        
        # === ТЕМПЕРАТУРНЫЕ УСЛОВИЯ ===
        if 'T2M_MAX' in day_data.columns and 'T2M_MIN' in day_data.columns:
            temp_probs = self._analyze_temperature(day_data, latitude)
            probabilities.update(temp_probs)
        
        # === ОСАДКИ ===
        if 'PRECTOTCORR' in day_data.columns:
            precip_probs = self._analyze_precipitation(day_data)
            probabilities.update(precip_probs)
        
        # === ВЕТЕР ===
        if 'WS2M' in day_data.columns:
            wind_probs = self._analyze_wind(day_data)
            probabilities.update(wind_probs)
        
        # === НАПРАВЛЕНИЕ ВЕТРА ===
        wind_dir_probs = self._analyze_wind_direction(day_data)
        if wind_dir_probs:
            probabilities.update(wind_dir_probs)
        
        # === ИНДЕКС КОМФОРТА ===
        if 'T2M' in day_data.columns and 'RH2M' in day_data.columns:
            comfort_probs = self._analyze_comfort(day_data)
            probabilities.update(comfort_probs)
        
        # === ВЛАЖНОСТЬ ===
        if 'RH2M' in day_data.columns:
            humidity_probs = self._analyze_humidity(day_data)
            probabilities.update(humidity_probs)
        
        # === ТОЧКА РОСЫ ===
        dew_point_probs = self._analyze_dew_point(day_data)
        if dew_point_probs:
            probabilities.update(dew_point_probs)
        
        # === ОБЛАЧНОСТЬ ===
        if 'CLOUD_AMT' in day_data.columns:
            cloud_probs = self._analyze_cloudiness(day_data)
            probabilities.update(cloud_probs)
        
        # === ВИДИМОСТЬ ===
        visibility_probs = self._analyze_visibility(day_data)
        if visibility_probs:
            probabilities.update(visibility_probs)
        
        # === UV ИНДЕКС ===
        if 'ALLSKY_SFC_UV_INDEX' in day_data.columns:
            uv_probs = self._analyze_uv_index(day_data)
            probabilities.update(uv_probs)
        
        # === СОЛНЕЧНАЯ РАДИАЦИЯ ===
        if 'ALLSKY_SFC_SW_DWN' in day_data.columns:
            solar_probs = self._analyze_solar_radiation(day_data)
            probabilities.update(solar_probs)
        
        # === АТМОСФЕРНОЕ ДАВЛЕНИЕ ===
        if 'PS' in day_data.columns:
            pressure_probs = self._analyze_pressure(day_data)
            probabilities.update(pressure_probs)
        
        # === СНЕГ (для зимних месяцев) ===
        if 'SNODP' in day_data.columns:
            snow_probs = self._analyze_snow(day_data)
            probabilities.update(snow_probs)
        
        # === ОЩУЩАЕМАЯ ТЕМПЕРАТУРА ===
        apparent_temp_probs = self._analyze_apparent_temperature(day_data)
        if apparent_temp_probs:
            probabilities.update(apparent_temp_probs)
        
        # === ПОГОДНЫЕ УСЛОВИЯ (WMO коды) ===
        weather_probs = self._analyze_weather_conditions(day_data)
        if weather_probs:
            probabilities.update(weather_probs)
        
        # === ПОРЫВЫ ВЕТРА ===
        gust_probs = self._analyze_wind_gusts(day_data)
        if gust_probs:
            probabilities.update(gust_probs)
        
        # === КАЧЕСТВО ВОЗДУХА ===
        air_quality_probs = self._analyze_air_quality(day_data)
        if air_quality_probs:
            probabilities.update(air_quality_probs)
        
        # === РИСК ГРОЗЫ ===
        thunderstorm_probs = self._analyze_thunderstorm_risk(day_data)
        if thunderstorm_probs:
            probabilities.update(thunderstorm_probs)
        
        # === СТАТИСТИКА ===
        statistics = self._calculate_statistics(day_data)
        
        return {
            'day_of_year': day_of_year,
            'date_example': self._day_to_date_string(day_of_year),
            'probabilities': probabilities,
            'statistics': statistics,
            'data_points': len(day_data)
        }
    
    def _analyze_temperature(self, day_data: pd.DataFrame, 
                            latitude: Optional[float] = None) -> Dict:
        """Анализ температурных условий"""
        probabilities = {}
        
        # Используем относительные пороги (перцентили)
        temp_max = day_data['T2M_MAX']
        temp_min = day_data['T2M_MIN']
        
        # Очень жарко (>90-й перцентиль ИЛИ >30°C)
        percentile_90 = temp_max.quantile(0.90)
        very_hot_threshold = max(percentile_90, 
                                self.config.TEMPERATURE_THRESHOLDS['very_hot']['absolute_min'])
        probabilities['very_hot'] = (temp_max > very_hot_threshold).mean()
        
        # Жарко (>75-й перцентиль ИЛИ >25°C)
        percentile_75 = temp_max.quantile(0.75)
        hot_threshold = max(percentile_75,
                           self.config.TEMPERATURE_THRESHOLDS['hot']['absolute_min'])
        probabilities['hot'] = (temp_max > hot_threshold).mean()
        
        # Очень холодно (<10-й перцентиль ИЛИ <-10°C)
        percentile_10 = temp_min.quantile(0.10)
        very_cold_threshold = min(percentile_10,
                                 self.config.TEMPERATURE_THRESHOLDS['very_cold']['absolute_min'])
        probabilities['very_cold'] = (temp_min < very_cold_threshold).mean()
        
        # Холодно (<25-й перцентиль ИЛИ <10°C)
        percentile_25 = temp_min.quantile(0.25)
        cold_threshold = min(percentile_25,
                            self.config.TEMPERATURE_THRESHOLDS['cold']['absolute_max'])
        probabilities['cold'] = (temp_min < cold_threshold).mean()
        
        # Комфортная температура (15-25°C)
        if 'T2M' in day_data.columns:
            temp_mean = day_data['T2M']
            comfortable_temp = (temp_mean >= 15) & (temp_mean <= 25)
            probabilities['comfortable_temperature'] = comfortable_temp.mean()
        
        return probabilities
    
    def _analyze_precipitation(self, day_data: pd.DataFrame) -> Dict:
        """Анализ осадков"""
        probabilities = {}
        
        precip = day_data['PRECTOTCORR']
        
        # Очень влажно (сильные осадки)
        very_wet = precip > self.config.PRECIPITATION_THRESHOLDS['very_wet']
        probabilities['very_wet'] = very_wet.mean()
        
        # Сильный дождь
        heavy_rain = precip > self.config.PRECIPITATION_THRESHOLDS['heavy_rain']
        probabilities['heavy_rain'] = heavy_rain.mean()
        
        # Умеренный дождь
        moderate_rain = (precip > self.config.PRECIPITATION_THRESHOLDS['moderate_rain']) & \
                       (precip <= self.config.PRECIPITATION_THRESHOLDS['heavy_rain'])
        probabilities['moderate_rain'] = moderate_rain.mean()
        
        # Легкий дождь
        light_rain = (precip > self.config.PRECIPITATION_THRESHOLDS['light_rain']) & \
                    (precip <= self.config.PRECIPITATION_THRESHOLDS['moderate_rain'])
        probabilities['light_rain'] = light_rain.mean()
        
        # Сухо
        dry = precip < self.config.PRECIPITATION_THRESHOLDS['very_dry']
        probabilities['dry'] = dry.mean()
        
        return probabilities
    
    def _analyze_wind(self, day_data: pd.DataFrame) -> Dict:
        """Анализ ветра"""
        probabilities = {}
        
        wind = day_data['WS2M']
        
        # Очень ветрено
        very_windy = wind > self.config.WIND_THRESHOLDS['very_windy']
        probabilities['very_windy'] = very_windy.mean()
        
        # Сильный ветер
        strong_wind = (wind > self.config.WIND_THRESHOLDS['strong_wind']) & \
                     (wind <= self.config.WIND_THRESHOLDS['very_windy'])
        probabilities['strong_wind'] = strong_wind.mean()
        
        # Умеренный ветер
        moderate_wind = (wind > self.config.WIND_THRESHOLDS['moderate_wind']) & \
                       (wind <= self.config.WIND_THRESHOLDS['strong_wind'])
        probabilities['moderate_wind'] = moderate_wind.mean()
        
        # Штиль
        calm = wind < self.config.WIND_THRESHOLDS['calm']
        probabilities['calm'] = calm.mean()
        
        return probabilities
    
    def _analyze_wind_direction(self, day_data: pd.DataFrame) -> Dict:
        """
        Анализ направления ветра (8 категорий)
        Использует WD2M или WD10M (градусы: 0° = Север, 90° = Восток, 180° = Юг, 270° = Запад)
        """
        probabilities = {}
        
        # Выбираем доступный параметр направления ветра
        wind_dir_col = None
        if 'WD10M' in day_data.columns:
            wind_dir_col = 'WD10M'
        elif 'WD2M' in day_data.columns:
            wind_dir_col = 'WD2M'
        
        if wind_dir_col is None:
            return probabilities
            
        wind_dir = day_data[wind_dir_col]
        
        # Север (337.5° - 22.5°)
        # Специальная обработка для диапазона через 0°
        wind_north = ((wind_dir >= 337.5) | (wind_dir < 22.5))
        probabilities['wind_from_north'] = wind_north.mean()
        
        # Северо-восток (22.5° - 67.5°)
        wind_ne = (wind_dir >= 22.5) & (wind_dir < 67.5)
        probabilities['wind_from_northeast'] = wind_ne.mean()
        
        # Восток (67.5° - 112.5°)
        wind_east = (wind_dir >= 67.5) & (wind_dir < 112.5)
        probabilities['wind_from_east'] = wind_east.mean()
        
        # Юго-восток (112.5° - 157.5°)
        wind_se = (wind_dir >= 112.5) & (wind_dir < 157.5)
        probabilities['wind_from_southeast'] = wind_se.mean()
        
        # Юг (157.5° - 202.5°)
        wind_south = (wind_dir >= 157.5) & (wind_dir < 202.5)
        probabilities['wind_from_south'] = wind_south.mean()
        
        # Юго-запад (202.5° - 247.5°)
        wind_sw = (wind_dir >= 202.5) & (wind_dir < 247.5)
        probabilities['wind_from_southwest'] = wind_sw.mean()
        
        # Запад (247.5° - 292.5°)
        wind_west = (wind_dir >= 247.5) & (wind_dir < 292.5)
        probabilities['wind_from_west'] = wind_west.mean()
        
        # Северо-запад (292.5° - 337.5°)
        wind_nw = (wind_dir >= 292.5) & (wind_dir < 337.5)
        probabilities['wind_from_northwest'] = wind_nw.mean()
        
        return probabilities
    
    def _analyze_comfort(self, day_data: pd.DataFrame) -> Dict:
        """
        Анализ индекса комфорта (учитывает температуру + влажность)
        """
        probabilities = {}
        
        temp = day_data['T2M']
        humidity = day_data['RH2M']
        
        # Рассчитываем Heat Index для каждой строки
        heat_indices = []
        for t, h in zip(temp, humidity):
            hi = self.config.calculate_heat_index(t, h)
            heat_indices.append(hi)
        
        day_data = day_data.copy()
        day_data['heat_index'] = heat_indices
        
        # Очень некомфортно (высокий heat index)
        very_uncomfortable = day_data['heat_index'] > \
            self.config.COMFORT_INDEX['very_uncomfortable']['heat_index_min']
        probabilities['very_uncomfortable'] = very_uncomfortable.mean()
        
        # Некомфортно жарко (жарко + влажно)
        uncomfortable_hot = (
            (temp > self.config.COMFORT_INDEX['uncomfortable_hot']['temp_min']) &
            (humidity > self.config.COMFORT_INDEX['uncomfortable_hot']['humidity_min'])
        )
        probabilities['uncomfortable_hot'] = uncomfortable_hot.mean()
        
        # Комфортно
        temp_range = self.config.COMFORT_INDEX['comfortable']['temp_range']
        humidity_max = self.config.COMFORT_INDEX['comfortable']['humidity_max']
        
        comfortable = (
            (temp >= temp_range[0]) &
            (temp <= temp_range[1]) &
            (humidity <= humidity_max)
        )
        probabilities['comfortable'] = comfortable.mean()
        
        return probabilities
    
    def _analyze_humidity(self, day_data: pd.DataFrame) -> Dict:
        """
        Анализ влажности воздуха (5 категорий)
        """
        probabilities = {}
        
        humidity = day_data['RH2M']
        
        # Очень сухо (< 30%)
        very_dry_humid = humidity < 30
        probabilities['very_dry_humidity'] = very_dry_humid.mean()
        
        # Сухо (30-40%)
        dry_humid = (humidity >= 30) & (humidity < 40)
        probabilities['dry_humidity'] = dry_humid.mean()
        
        # Комфортная влажность (40-60%)
        comfortable_humid = (humidity >= 40) & (humidity <= 60)
        probabilities['comfortable_humidity'] = comfortable_humid.mean()
        
        # Влажно (60-80%)
        humid = (humidity > 60) & (humidity <= 80)
        probabilities['humid'] = humid.mean()
        
        # Очень влажно (> 80%)
        very_humid = humidity > 80
        probabilities['very_humid'] = very_humid.mean()
        
        return probabilities
    
    def _analyze_dew_point(self, day_data: pd.DataFrame) -> Dict:
        """
        Анализ точки росы (7 категорий)
        Точка росы показывает риск конденсации и уровень дискомфорта от влажности
        """
        probabilities = {}
        
        if 'T2MDEW' not in day_data.columns:
            return probabilities
            
        dew_point = day_data['T2MDEW']
        
        # Очень сухо (< 0°C) - зима, комфортно
        dew_very_dry = dew_point < 0
        probabilities['dew_point_very_dry'] = dew_very_dry.mean()
        
        # Сухо (0-10°C) - сухо, комфортно
        dew_dry = (dew_point >= 0) & (dew_point < 10)
        probabilities['dew_point_dry'] = dew_dry.mean()
        
        # Комфортно (10-15°C) - приятно
        dew_comfortable = (dew_point >= 10) & (dew_point <= 15)
        probabilities['dew_point_comfortable'] = dew_comfortable.mean()
        
        # Влажновато (15-18°C)
        dew_humid = (dew_point > 15) & (dew_point <= 18)
        probabilities['dew_point_humid'] = dew_humid.mean()
        
        # Душно (18-21°C)
        dew_muggy = (dew_point > 18) & (dew_point <= 21)
        probabilities['dew_point_muggy'] = dew_muggy.mean()
        
        # Тяжело дышать (21-24°C)
        dew_oppressive = (dew_point > 21) & (dew_point <= 24)
        probabilities['dew_point_oppressive'] = dew_oppressive.mean()
        
        # Крайне душно (> 24°C)
        dew_extreme = dew_point > 24
        probabilities['dew_point_extreme'] = dew_extreme.mean()
        
        return probabilities
    
    def _analyze_cloudiness(self, day_data: pd.DataFrame) -> Dict:
        """
        Анализ облачности"""
        probabilities = {}
        
        cloud = day_data['CLOUD_AMT']
        
        # Ясно
        clear = cloud < self.config.CLOUD_THRESHOLDS['clear']
        probabilities['clear'] = clear.mean()
        
        # Переменная облачность
        partly_cloudy = (cloud >= self.config.CLOUD_THRESHOLDS['clear']) & \
                       (cloud < self.config.CLOUD_THRESHOLDS['partly_cloudy'])
        probabilities['partly_cloudy'] = partly_cloudy.mean()
        
        # Облачно
        mostly_cloudy = (cloud >= self.config.CLOUD_THRESHOLDS['partly_cloudy']) & \
                       (cloud < self.config.CLOUD_THRESHOLDS['mostly_cloudy'])
        probabilities['mostly_cloudy'] = mostly_cloudy.mean()
        
        # Пасмурно
        overcast = cloud >= self.config.CLOUD_THRESHOLDS['overcast']
        probabilities['overcast'] = overcast.mean()
        
        return probabilities
    
    def _analyze_visibility(self, day_data: pd.DataFrame) -> Dict:
        """
        Анализ видимости (5 категорий)
        Расчетная модель на основе влажности и облачности
        Высокая влажность + облачность = низкая видимость (туман)
        """
        probabilities = {}
        
        # Проверяем наличие нужных колонок
        if 'RH2M' not in day_data.columns or 'CLOUD_AMT' not in day_data.columns:
            return probabilities
        
        humidity = day_data['RH2M']
        cloudiness = day_data['CLOUD_AMT']
        
        # Простая модель: видимость ухудшается при высокой влажности и облачности
        # Вычисляем "индекс плохой видимости" (0-100)
        visibility_index = (humidity * 0.6 + cloudiness * 0.4)
        
        # Очень плохая видимость (туман) - индекс > 85
        vis_very_poor = visibility_index > 85
        probabilities['visibility_very_poor'] = vis_very_poor.mean()
        
        # Плохая видимость - индекс 70-85
        vis_poor = (visibility_index > 70) & (visibility_index <= 85)
        probabilities['visibility_poor'] = vis_poor.mean()
        
        # Умеренная видимость - индекс 50-70
        vis_moderate = (visibility_index > 50) & (visibility_index <= 70)
        probabilities['visibility_moderate'] = vis_moderate.mean()
        
        # Хорошая видимость - индекс 30-50
        vis_good = (visibility_index > 30) & (visibility_index <= 50)
        probabilities['visibility_good'] = vis_good.mean()
        
        # Отличная видимость - индекс < 30
        vis_excellent = visibility_index <= 30
        probabilities['visibility_excellent'] = vis_excellent.mean()
        
        return probabilities
    
    def _analyze_uv_index(self, day_data: pd.DataFrame) -> Dict:
        """
        Анализ UV индекса"""
        probabilities = {}
        
        uv = day_data['ALLSKY_SFC_UV_INDEX']
        
        # Низкий UV
        low_uv = uv < self.config.UV_THRESHOLDS['low']
        probabilities['low_uv'] = low_uv.mean()
        
        # Умеренный UV
        moderate_uv = (uv >= self.config.UV_THRESHOLDS['low']) & \
                     (uv < self.config.UV_THRESHOLDS['moderate'])
        probabilities['moderate_uv'] = moderate_uv.mean()
        
        # Высокий UV
        high_uv = (uv >= self.config.UV_THRESHOLDS['moderate']) & \
                 (uv < self.config.UV_THRESHOLDS['high'])
        probabilities['high_uv'] = high_uv.mean()
        
        # Очень высокий UV
        very_high_uv = (uv >= self.config.UV_THRESHOLDS['high']) & \
                      (uv < self.config.UV_THRESHOLDS['very_high'])
        probabilities['very_high_uv'] = very_high_uv.mean()
        
        # Экстремальный UV
        extreme_uv = uv >= self.config.UV_THRESHOLDS['extreme']
        probabilities['extreme_uv'] = extreme_uv.mean()
        
        return probabilities
    
    def _analyze_solar_radiation(self, day_data: pd.DataFrame) -> Dict:
        """
        Анализ солнечной радиации (4 категории)
        """
        probabilities = {}
        
        if 'ALLSKY_SFC_SW_DWN' not in day_data.columns:
            return probabilities
            
        solar = day_data['ALLSKY_SFC_SW_DWN']
        
        # Очень низкая (< 2 кВт-ч/м²/день) - пасмурно
        very_low_solar = solar < 2.0
        probabilities['very_low_solar'] = very_low_solar.mean()
        
        # Низкая (2-4 кВт-ч/м²/день)
        low_solar = (solar >= 2.0) & (solar < 4.0)
        probabilities['low_solar'] = low_solar.mean()
        
        # Умеренная (4-6 кВт-ч/м²/день)
        moderate_solar = (solar >= 4.0) & (solar < 6.0)
        probabilities['moderate_solar'] = moderate_solar.mean()
        
        # Высокая (> 6 кВт-ч/м²/день) - ясно
        high_solar = solar >= 6.0
        probabilities['high_solar'] = high_solar.mean()
        
        return probabilities
    
    def _analyze_pressure(self, day_data: pd.DataFrame) -> Dict:
        """Анализ атмосферного давления"""
        probabilities = {}
        
        pressure = day_data['PS']
        
        # Очень низкое (циклон)
        very_low_pressure = pressure < self.config.PRESSURE_THRESHOLDS['very_low']
        probabilities['very_low_pressure'] = very_low_pressure.mean()
        
        # Низкое (дождь вероятен)
        low_pressure = (pressure >= self.config.PRESSURE_THRESHOLDS['very_low']) & \
                      (pressure < self.config.PRESSURE_THRESHOLDS['low'])
        probabilities['low_pressure'] = low_pressure.mean()
        
        # Нормальное
        normal_pressure = (pressure >= self.config.PRESSURE_THRESHOLDS['low']) & \
                         (pressure < self.config.PRESSURE_THRESHOLDS['high'])
        probabilities['normal_pressure'] = normal_pressure.mean()
        
        # Высокое (ясная погода)
        high_pressure = (pressure >= self.config.PRESSURE_THRESHOLDS['high']) & \
                       (pressure < self.config.PRESSURE_THRESHOLDS['very_high'])
        probabilities['high_pressure'] = high_pressure.mean()
        
        # Очень высокое (антициклон)
        very_high_pressure = pressure >= self.config.PRESSURE_THRESHOLDS['very_high']
        probabilities['very_high_pressure'] = very_high_pressure.mean()
        
        return probabilities
    
    def _analyze_snow(self, day_data: pd.DataFrame) -> Dict:
        """
        Анализ снежного покрова"""
        probabilities = {}
        
        snow = day_data['SNODP']
        
        # Нет снега
        no_snow = snow <= self.config.SNOW_THRESHOLDS['no_snow']
        probabilities['no_snow'] = no_snow.mean()
        
        # Легкий снег
        light_snow = (snow > self.config.SNOW_THRESHOLDS['no_snow']) & \
                    (snow <= self.config.SNOW_THRESHOLDS['light_snow'])
        probabilities['light_snow'] = light_snow.mean()
        
        # Умеренный снег
        moderate_snow = (snow > self.config.SNOW_THRESHOLDS['light_snow']) & \
                       (snow <= self.config.SNOW_THRESHOLDS['moderate_snow'])
        probabilities['moderate_snow'] = moderate_snow.mean()
        
        # Сильный снег
        heavy_snow = (snow > self.config.SNOW_THRESHOLDS['moderate_snow']) & \
                    (snow <= self.config.SNOW_THRESHOLDS['heavy_snow'])
        probabilities['heavy_snow'] = heavy_snow.mean()
        
        # Очень сильный снег
        very_heavy_snow = snow > self.config.SNOW_THRESHOLDS['very_heavy_snow']
        probabilities['very_heavy_snow'] = very_heavy_snow.mean()
        
        return probabilities
    
    def _calculate_statistics(self, day_data: pd.DataFrame) -> Dict:
        """
        Рассчитать базовую статистику для всех параметров"""
        statistics = {}
        
        # Температура
        if 'T2M' in day_data.columns:
            statistics['temperature'] = {
                'mean': float(day_data['T2M'].mean()),
                'min': float(day_data['T2M_MIN'].min()) if 'T2M_MIN' in day_data.columns else None,
                'max': float(day_data['T2M_MAX'].max()) if 'T2M_MAX' in day_data.columns else None,
                'std': float(day_data['T2M'].std()),
                'percentile_10': float(day_data['T2M'].quantile(0.10)),
                'percentile_90': float(day_data['T2M'].quantile(0.90))
            }
        
        # Осадки
        if 'PRECTOTCORR' in day_data.columns:
            statistics['precipitation'] = {
                'mean': float(day_data['PRECTOTCORR'].mean()),
                'max': float(day_data['PRECTOTCORR'].max()),
                'std': float(day_data['PRECTOTCORR'].std()),
                'percentile_90': float(day_data['PRECTOTCORR'].quantile(0.90))
            }
        
        # Ветер
        if 'WS2M' in day_data.columns:
            statistics['wind'] = {
                'mean': float(day_data['WS2M'].mean()),
                'max': float(day_data['WS2M'].max()),
                'std': float(day_data['WS2M'].std()),
                'percentile_90': float(day_data['WS2M'].quantile(0.90))
            }
        
        # Влажность
        if 'RH2M' in day_data.columns:
            statistics['humidity'] = {
                'mean': float(day_data['RH2M'].mean()),
                'min': float(day_data['RH2M'].min()),
                'max': float(day_data['RH2M'].max()),
                'std': float(day_data['RH2M'].std())
            }
        
        # Точка росы
        if 'T2MDEW' in day_data.columns:
            statistics['dew_point'] = {
                'mean': float(day_data['T2MDEW'].mean()),
                'min': float(day_data['T2MDEW'].min()),
                'max': float(day_data['T2MDEW'].max())
            }
        
        # Облачность
        if 'CLOUD_AMT' in day_data.columns:
            statistics['cloudiness'] = {
                'mean': float(day_data['CLOUD_AMT'].mean()),
                'min': float(day_data['CLOUD_AMT'].min()),
                'max': float(day_data['CLOUD_AMT'].max())
            }
        
        # UV индекс
        if 'ALLSKY_SFC_UV_INDEX' in day_data.columns:
            statistics['uv_index'] = {
                'mean': float(day_data['ALLSKY_SFC_UV_INDEX'].mean()),
                'max': float(day_data['ALLSKY_SFC_UV_INDEX'].max()),
                'percentile_90': float(day_data['ALLSKY_SFC_UV_INDEX'].quantile(0.90))
            }
        
        # Солнечная радиация
        if 'ALLSKY_SFC_SW_DWN' in day_data.columns:
            statistics['solar_radiation'] = {
                'mean': float(day_data['ALLSKY_SFC_SW_DWN'].mean()),
                'max': float(day_data['ALLSKY_SFC_SW_DWN'].max())
            }
        
        # Атмосферное давление
        if 'PS' in day_data.columns:
            statistics['pressure'] = {
                'mean': float(day_data['PS'].mean()),
                'min': float(day_data['PS'].min()),
                'max': float(day_data['PS'].max()),
                'std': float(day_data['PS'].std())
            }
        
        # Снег
        if 'SNODP' in day_data.columns:
            statistics['snow'] = {
                'mean': float(day_data['SNODP'].mean()),
                'max': float(day_data['SNODP'].max()),
                'days_with_snow': int((day_data['SNODP'] > 0).sum())
            }
        
        # Ветер на 10м
        if 'WS10M' in day_data.columns:
            statistics['wind_10m'] = {
                'mean': float(day_data['WS10M'].mean()),
                'max': float(day_data['WS10M'].max())
            }
        
        # Ощущаемая температура
        if 'apparent_temperature_mean' in day_data.columns:
            statistics['apparent_temperature'] = {
                'mean': float(day_data['apparent_temperature_mean'].mean()),
                'min': float(day_data['apparent_temperature_mean'].min()),
                'max': float(day_data['apparent_temperature_mean'].max()),
                'std': float(day_data['apparent_temperature_mean'].std())
            }
        
        # Порывы ветра
        if 'windgusts_10m_max' in day_data.columns:
            statistics['wind_gusts'] = {
                'mean': float(day_data['windgusts_10m_max'].mean()),
                'max': float(day_data['windgusts_10m_max'].max()),
                'percentile_90': float(day_data['windgusts_10m_max'].quantile(0.90))
            }
        
        # Код погоды (наиболее частый)
        if 'weathercode' in day_data.columns:
            most_common_code = int(day_data['weathercode'].mode()[0]) if len(day_data['weathercode'].mode()) > 0 else None
            if most_common_code is not None:
                statistics['weather_code'] = {
                    'most_common': most_common_code,
                    'description': self.config.WEATHER_CODE_DESCRIPTION.get(most_common_code, 'Unknown'),
                    'category': self.config.get_weather_code_category(most_common_code)
                }
        
        # Качество воздуха (AOD)
        if 'AODANA' in day_data.columns:
            aod_mean = float(day_data['AODANA'].mean())
            statistics['air_quality'] = {
                'aod_mean': aod_mean,
                'aod_max': float(day_data['AODANA'].max()),
                'level': self.config.get_air_quality_level(aod_mean)
            }
        
        # Черный углерод
        if 'BCSMASS' in day_data.columns:
            statistics['black_carbon'] = {
                'mean': float(day_data['BCSMASS'].mean()),
                'max': float(day_data['BCSMASS'].max()),
                'percentile_90': float(day_data['BCSMASS'].quantile(0.90))
            }
        
        # Пыль
        if 'DUSMASS' in day_data.columns:
            statistics['dust'] = {
                'mean': float(day_data['DUSMASS'].mean()),
                'max': float(day_data['DUSMASS'].max()),
                'percentile_90': float(day_data['DUSMASS'].quantile(0.90))
            }
        
        # Грозовая активность (CAPE)
        if 'cape' in day_data.columns:
            cape_mean = float(day_data['cape'].mean())
            statistics['thunderstorm'] = {
                'cape_mean': cape_mean,
                'cape_max': float(day_data['cape'].max()),
                'risk_level': self.config.get_thunderstorm_risk(cape_mean)
            }
        
        return statistics
    
    def analyze_date_range(self, data: pd.DataFrame, start_day: int, 
                          end_day: int, latitude: float = None) -> List[Dict]:
        """
        Анализировать диапазон дней
        
        Args:
            data: DataFrame с историческими данными
            start_day: Начальный день года (1-365)
            end_day: Конечный день года (1-365)
            latitude: Широта
            
        Returns:
            Список результатов анализа для каждого дня
        """
        results = []
        
        for day in range(start_day, end_day + 1):
            result = self.analyze_day(data, day, latitude)
            results.append(result)
        
        return results
    
    def get_summary_probabilities(self, data: pd.DataFrame, day_of_year: int,
                                  latitude: float = None) -> Dict:
        """
        Получить упрощенные вероятности (только главные категории)
        для удобного отображения пользователю.
        
        Возвращает структуру для отображения на сайте:
        - main_features: 8 основных блоков со ВСЕМИ категориями и вероятностями
        - additional_features: 12 дополнительных признаков с ОДНОЙ самой вероятной категорией
        - probabilities: старая структура для обратной совместимости (8 ключевых категорий)
        """
        full_analysis = self.analyze_day(data, day_of_year, latitude)
        
        if 'error' in full_analysis:
            return full_analysis
        
        probs = full_analysis['probabilities']
        
        # ===== СТАРАЯ СТРУКТУРА (для обратной совместимости) =====
        old_summary = {
            'very_cold': probs.get('very_cold', 0.0),
            'cold': probs.get('cold', 0.0),
            'comfortable': probs.get('comfortable', 0.0),
            'hot': probs.get('hot', 0.0),
            'very_hot': probs.get('very_hot', 0.0),
            'very_wet': probs.get('very_wet', 0.0),
            'very_windy': probs.get('very_windy', 0.0),
            'very_uncomfortable': probs.get('very_uncomfortable', 0.0)
        }
        
        # ===== НОВАЯ СТРУКТУРА ДЛЯ САЙТА =====
        
        # 8 ОСНОВНЫХ БЛОКОВ - показываем ВСЕ категории с вероятностями
        main_features = {
            'temperature': {
                'very_cold': probs.get('very_cold', 0.0),
                'cold': probs.get('cold', 0.0),
                'cool': probs.get('cool', 0.0),
                'comfortable': probs.get('comfortable', 0.0),
                'warm': probs.get('warm', 0.0),
                'hot': probs.get('hot', 0.0),
                'very_hot': probs.get('very_hot', 0.0)
            },
            'precipitation': {
                'dry': probs.get('dry', 0.0),
                'light_rain': probs.get('light_rain', 0.0),
                'moderate_rain': probs.get('moderate_rain', 0.0),
                'heavy_rain': probs.get('heavy_rain', 0.0),
                'very_wet': probs.get('very_wet', 0.0)
            },
            'wind': {
                'calm': probs.get('calm', 0.0),
                'light_breeze': probs.get('light_breeze', 0.0),
                'moderate_wind': probs.get('moderate_wind', 0.0),
                'strong_wind': probs.get('strong_wind', 0.0),
                'very_windy': probs.get('very_windy', 0.0)
            },
            'cloudiness': {
                'clear': probs.get('clear', 0.0),
                'partly_cloudy': probs.get('partly_cloudy', 0.0),
                'mostly_cloudy': probs.get('mostly_cloudy', 0.0),
                'overcast': probs.get('overcast', 0.0)
            },
            'uv_index': {
                'low_uv': probs.get('low_uv', 0.0),
                'moderate_uv': probs.get('moderate_uv', 0.0),
                'high_uv': probs.get('high_uv', 0.0),
                'very_high_uv': probs.get('very_high_uv', 0.0),
                'extreme_uv': probs.get('extreme_uv', 0.0)
            },
            'pressure': {
                'low_pressure': probs.get('low_pressure', 0.0),
                'normal_pressure': probs.get('normal_pressure', 0.0),
                'high_pressure': probs.get('high_pressure', 0.0)
            },
            'comfort': {
                'comfortable_comfort': probs.get('comfortable_comfort', 0.0),
                'slightly_uncomfortable': probs.get('slightly_uncomfortable', 0.0),
                'uncomfortable': probs.get('uncomfortable', 0.0),
                'very_uncomfortable': probs.get('very_uncomfortable', 0.0)
            },
            'snow': {
                'no_snow': probs.get('no_snow', 0.0),
                'light_snow': probs.get('light_snow', 0.0),
                'moderate_snow': probs.get('moderate_snow', 0.0),
                'heavy_snow': probs.get('heavy_snow', 0.0)
            }
        }
        
        # 12 ДОПОЛНИТЕЛЬНЫХ ПРИЗНАКОВ - показываем ТОЛЬКО самую вероятную категорию
        additional_features = {}
        
        # Вспомогательная функция для нахождения максимальной категории
        def find_best_category(category_names):
            best_cat = None
            best_prob = -1.0
            for cat_name in category_names:
                prob = probs.get(cat_name, 0.0)
                if prob > best_prob:
                    best_prob = prob
                    best_cat = cat_name
            return best_cat, best_prob
        
        # 1. Apparent Temperature (Ощущаемая температура)
        apparent_cats = ['feels_very_cold', 'feels_cold', 'feels_cool', 'feels_comfortable', 
                         'feels_warm', 'feels_hot', 'feels_very_hot']
        cat, prob = find_best_category(apparent_cats)
        if cat:
            additional_features['apparent_temperature'] = {
                'category': cat,
                'probability': prob,
                'description': self._get_category_description('apparent_temperature', cat)
            }
        
        # 2. Dew Point (Точка росы)
        dew_cats = ['dew_very_dry', 'dew_dry', 'dew_comfortable', 'dew_humid', 
                    'dew_muggy', 'dew_oppressive', 'dew_extreme']
        cat, prob = find_best_category(dew_cats)
        if cat:
            additional_features['dew_point'] = {
                'category': cat,
                'probability': prob,
                'description': self._get_category_description('dew_point', cat)
            }
        
        # 3. Humidity (Влажность)
        humidity_cats = ['very_dry_air', 'dry_air', 'normal_humidity', 'humid', 'very_humid']
        cat, prob = find_best_category(humidity_cats)
        if cat:
            additional_features['humidity'] = {
                'category': cat,
                'probability': prob,
                'description': self._get_category_description('humidity', cat)
            }
        
        # 4. Wind Direction (Направление ветра)
        wind_dir_cats = ['wind_north', 'wind_northeast', 'wind_east', 'wind_southeast',
                        'wind_south', 'wind_southwest', 'wind_west', 'wind_northwest']
        cat, prob = find_best_category(wind_dir_cats)
        if cat:
            additional_features['wind_direction'] = {
                'category': cat,
                'probability': prob,
                'description': self._get_category_description('wind_direction', cat)
            }
        
        # 5. Wind Gusts (Порывы ветра)
        gust_cats = ['no_gusts', 'light_gusts', 'moderate_gusts', 'strong_gusts', 'severe_gusts']
        cat, prob = find_best_category(gust_cats)
        if cat:
            additional_features['wind_gusts'] = {
                'category': cat,
                'probability': prob,
                'description': self._get_category_description('wind_gusts', cat)
            }
        
        # 6. Solar Radiation (Солнечная радиация)
        solar_cats = ['no_solar', 'low_solar', 'moderate_solar', 'high_solar', 'very_high_solar']
        cat, prob = find_best_category(solar_cats)
        if cat:
            additional_features['solar_radiation'] = {
                'category': cat,
                'probability': prob,
                'description': self._get_category_description('solar_radiation', cat)
            }
        
        # 7. Visibility (Видимость)
        visibility_cats = ['very_poor_visibility', 'poor_visibility', 'moderate_visibility',
                          'good_visibility', 'excellent_visibility']
        cat, prob = find_best_category(visibility_cats)
        if cat:
            additional_features['visibility'] = {
                'category': cat,
                'probability': prob,
                'description': self._get_category_description('visibility', cat)
            }
        
        # 8. Weather Codes (Коды погоды)
        weather_cats = ['clear_weather', 'partly_cloudy_weather', 'cloudy_weather', 
                       'rain_weather', 'snow_weather', 'thunderstorm_weather', 'fog_weather']
        cat, prob = find_best_category(weather_cats)
        if cat:
            additional_features['weather_codes'] = {
                'category': cat,
                'probability': prob,
                'description': self._get_category_description('weather_codes', cat)
            }
        
        # 9. Air Quality Index (Качество воздуха)
        aqi_cats = ['good_air', 'moderate_air', 'unhealthy_sensitive', 'unhealthy_air', 
                   'very_unhealthy_air', 'hazardous_air']
        cat, prob = find_best_category(aqi_cats)
        if cat:
            additional_features['air_quality'] = {
                'category': cat,
                'probability': prob,
                'description': self._get_category_description('air_quality', cat)
            }
        
        # 10. Black Carbon (Черный углерод)
        bc_cats = ['low_bc', 'moderate_bc', 'high_bc', 'very_high_bc']
        cat, prob = find_best_category(bc_cats)
        if cat:
            additional_features['black_carbon'] = {
                'category': cat,
                'probability': prob,
                'description': self._get_category_description('black_carbon', cat)
            }
        
        # 11. Dust (Пыль)
        dust_cats = ['low_dust', 'moderate_dust', 'high_dust', 'very_high_dust']
        cat, prob = find_best_category(dust_cats)
        if cat:
            additional_features['dust'] = {
                'category': cat,
                'probability': prob,
                'description': self._get_category_description('dust', cat)
            }
        
        # 12. Thunderstorm Risk (Риск грозы)
        thunder_cats = ['no_storm_risk', 'low_storm_risk', 'moderate_storm_risk', 
                       'high_storm_risk', 'extreme_storm_risk']
        cat, prob = find_best_category(thunder_cats)
        if cat:
            additional_features['thunderstorm_risk'] = {
                'category': cat,
                'probability': prob,
                'description': self._get_category_description('thunderstorm_risk', cat)
            }
        
        # ===== ВОЗВРАТ С ОБРАТНОЙ СОВМЕСТИМОСТЬЮ =====
        return {
            'day_of_year': day_of_year,
            'date_example': full_analysis['date_example'],
            'probabilities': old_summary,  # Старая структура - 8 ключевых категорий
            'main_features': main_features,  # Новая структура - 8 блоков со всеми категориями
            'additional_features': additional_features,  # Новая структура - 12 признаков с лучшей категорией
            'statistics': full_analysis['statistics']
        }
    
    def _get_category_description(self, feature: str, category: str) -> str:
        """Получить человекочитаемое описание категории для фронтенда"""
        descriptions = {
            # Ощущаемая температура
            'extreme_cold_feels': 'Ощущается экстремально холодно',
            'very_cold_feels': 'Ощущается очень холодно',
            'cold_feels': 'Ощущается холодно',
            'cool_feels': 'Ощущается прохладно',
            'comfortable_feels': 'Ощущается комфортно',
            'warm_feels': 'Ощущается тепло',
            'hot_feels': 'Ощущается жарко',
            'very_hot_feels': 'Ощущается очень жарко',
            'extreme_heat_feels': 'Ощущается невыносимо жарко',
            # Точка росы
            'dew_point_very_dry': 'Очень сухой воздух',
            'dew_point_dry': 'Сухой воздух',
            'dew_point_comfortable': 'Комфортная влажность',
            'dew_point_humid': 'Влажный воздух',
            'dew_point_muggy': 'Душный воздух',
            'dew_point_oppressive': 'Очень душно',
            'dew_point_extreme': 'Крайне душно',
            # Влажность
            'very_dry_humidity': 'Очень низкая влажность',
            'dry_humidity': 'Низкая влажность',
            'comfortable_humidity': 'Комфортная влажность',
            'humid': 'Повышенная влажность',
            'very_humid': 'Очень высокая влажность',
            # Направление ветра
            'wind_from_north': 'Северный ветер',
            'wind_from_northeast': 'Северо-восточный ветер',
            'wind_from_east': 'Восточный ветер',
            'wind_from_southeast': 'Юго-восточный ветер',
            'wind_from_south': 'Южный ветер',
            'wind_from_southwest': 'Юго-западный ветер',
            'wind_from_west': 'Западный ветер',
            'wind_from_northwest': 'Северо-западный ветер',
            # Порывы ветра
            'calm_gusts': 'Слабые порывы',
            'moderate_gusts': 'Умеренные порывы',
            'strong_gusts': 'Сильные порывы',
            'very_strong_gusts': 'Очень сильные порывы',
            'storm_gusts': 'Штормовые порывы',
            'hurricane_gusts': 'Ураганные порывы',
            # Солнечная радиация
            'very_low_solar': 'Очень низкая радиация',
            'low_solar': 'Низкая радиация',
            'moderate_solar': 'Умеренная радиация',
            'high_solar': 'Высокая радиация',
            # Видимость
            'visibility_very_poor': 'Очень плохая видимость (туман)',
            'visibility_poor': 'Плохая видимость',
            'visibility_moderate': 'Умеренная видимость',
            'visibility_good': 'Хорошая видимость',
            'visibility_excellent': 'Отличная видимость',
            # Коды погоды
            'weather_clear': 'Ясно',
            'weather_cloudy': 'Облачно',
            'weather_fog': 'Туман',
            'weather_drizzle': 'Морось',
            'weather_rain': 'Дождь',
            'weather_snow': 'Снег',
            'weather_thunderstorm': 'Гроза',
            # Качество воздуха
            'air_quality_excellent': 'Отличное качество',
            'air_quality_good': 'Хорошее качество',
            'air_quality_moderate': 'Умеренное качество',
            'air_quality_poor': 'Плохое качество',
            'air_quality_very_poor': 'Очень плохое качество',
            'air_quality_hazardous': 'Опасное качество',
            # Черный углерод
            'black_carbon_clean': 'Чистый воздух',
            'black_carbon_low': 'Низкий уровень',
            'black_carbon_moderate': 'Умеренный уровень',
            'black_carbon_high': 'Высокий уровень',
            'black_carbon_very_high': 'Очень высокий уровень',
            'black_carbon_extreme': 'Экстремальный уровень',
            # Пыль
            'dust_minimal': 'Минимальное количество',
            'dust_low': 'Низкое количество',
            'dust_moderate': 'Умеренное количество',
            'dust_high': 'Высокое количество',
            'dust_very_high': 'Очень высокое количество',
            'dust_storm': 'Пыльная буря',
            # Риск грозы
            'thunderstorm_none': 'Грозы нет',
            'thunderstorm_very_low': 'Очень низкий риск',
            'thunderstorm_low': 'Низкий риск',
            'thunderstorm_moderate': 'Умеренный риск',
            'thunderstorm_high': 'Высокий риск',
            'thunderstorm_very_high': 'Очень высокий риск',
            'thunderstorm_extreme': 'Экстремальный риск'
        }
        return descriptions.get(category, category.replace('_', ' ').title())
    
    def _analyze_apparent_temperature(self, day_data: pd.DataFrame) -> Dict:
        """
        Анализ ощущаемой температуры (apparent temperature)
        Учитывает температуру, влажность и ветер
        """
        if 'apparent_temperature_mean' not in day_data.columns:
            # Если нет готового значения, вычисляем сами
            if all(col in day_data.columns for col in ['T2M', 'RH2M', 'WS2M']):
                day_data['apparent_temperature_calc'] = day_data.apply(
                    lambda row: self.config.calculate_apparent_temperature(
                        row['T2M'], row['RH2M'], row['WS2M']
                    ), axis=1
                )
                apparent_col = 'apparent_temperature_calc'
            else:
                return {}
        else:
            apparent_col = 'apparent_temperature_mean'
        
        thresholds = self.config.APPARENT_TEMPERATURE_THRESHOLDS
        total = len(day_data)
        
        return {
            'extreme_cold_feels_like': len(day_data[day_data[apparent_col] < thresholds['extreme_cold']]) / total,
            'very_cold_feels_like': len(day_data[(day_data[apparent_col] >= thresholds['extreme_cold']) &
                                                  (day_data[apparent_col] < thresholds['very_cold'])]) / total,
            'cold_feels_like': len(day_data[(day_data[apparent_col] >= thresholds['very_cold']) &
                                            (day_data[apparent_col] < thresholds['cold'])]) / total,
            'comfortable_feels_like': len(day_data[(day_data[apparent_col] >= thresholds['comfortable'][0]) &
                                                    (day_data[apparent_col] <= thresholds['comfortable'][1])]) / total,
            'hot_feels_like': len(day_data[(day_data[apparent_col] > thresholds['comfortable'][1]) &
                                           (day_data[apparent_col] < thresholds['hot'])]) / total,
            'very_hot_feels_like': len(day_data[(day_data[apparent_col] >= thresholds['hot']) &
                                                (day_data[apparent_col] < thresholds['very_hot'])]) / total,
            'extreme_heat_feels_like': len(day_data[day_data[apparent_col] >= thresholds['extreme_heat']]) / total,
        }
    
    def _analyze_weather_conditions(self, day_data: pd.DataFrame) -> Dict:
        """
        Анализ погодных условий по кодам WMO
        weathercode: 0-99 (ясно, облачно, дождь, снег, гроза и т.д.)
        """
        if 'weathercode' not in day_data.columns:
            return {}
        
        total = len(day_data)
        categories = self.config.WEATHER_CODE_CATEGORIES
        
        probs = {}
        for category, codes in categories.items():
            count = len(day_data[day_data['weathercode'].isin(codes)])
            probs[f'weather_{category}'] = count / total
        
        return probs
    
    def _analyze_wind_gusts(self, day_data: pd.DataFrame) -> Dict:
        """
        Анализ порывов ветра (windgusts)
        Критично для безопасности при активностях на открытом воздухе
        """
        gust_col = None
        if 'windgusts_10m_max' in day_data.columns:
            gust_col = 'windgusts_10m_max'
        elif 'wind_gusts' in day_data.columns:
            gust_col = 'wind_gusts'
        
        if gust_col is None:
            return {}
        
        thresholds = self.config.WIND_GUST_THRESHOLDS
        total = len(day_data)
        
        return {
            'calm_gusts': len(day_data[day_data[gust_col] < thresholds['calm']]) / total,
            'moderate_gusts': len(day_data[(day_data[gust_col] >= thresholds['calm']) &
                                           (day_data[gust_col] < thresholds['moderate'])]) / total,
            'strong_gusts': len(day_data[(day_data[gust_col] >= thresholds['moderate']) &
                                         (day_data[gust_col] < thresholds['strong'])]) / total,
            'very_strong_gusts': len(day_data[(day_data[gust_col] >= thresholds['strong']) &
                                              (day_data[gust_col] < thresholds['very_strong'])]) / total,
            'storm_gusts': len(day_data[(day_data[gust_col] >= thresholds['very_strong']) &
                                        (day_data[gust_col] < thresholds['storm'])]) / total,
            'hurricane_gusts': len(day_data[day_data[gust_col] >= thresholds['hurricane']]) / total,
        }
    
    def _analyze_air_quality(self, day_data: pd.DataFrame) -> Dict:
        """
        Анализ качества воздуха по AOD (Aerosol Optical Depth)
        Также анализирует черный углерод и пыль
        """
        probs = {}
        
        # Анализ AOD (качество воздуха)
        if 'AODANA' in day_data.columns or 'aod' in day_data.columns:
            aod_col = 'AODANA' if 'AODANA' in day_data.columns else 'aod'
            thresholds = self.config.AIR_QUALITY_THRESHOLDS
            total = len(day_data)
            
            probs['air_quality_excellent'] = len(day_data[day_data[aod_col] < thresholds['excellent']]) / total
            probs['air_quality_good'] = len(day_data[(day_data[aod_col] >= thresholds['excellent']) &
                                                      (day_data[aod_col] < thresholds['good'])]) / total
            probs['air_quality_moderate'] = len(day_data[(day_data[aod_col] >= thresholds['good']) &
                                                          (day_data[aod_col] < thresholds['moderate'])]) / total
            probs['air_quality_poor'] = len(day_data[(day_data[aod_col] >= thresholds['moderate']) &
                                                      (day_data[aod_col] < thresholds['poor'])]) / total
            probs['air_quality_very_poor'] = len(day_data[(day_data[aod_col] >= thresholds['poor']) &
                                                           (day_data[aod_col] < thresholds['very_poor'])]) / total
            probs['air_quality_hazardous'] = len(day_data[day_data[aod_col] >= thresholds['hazardous']]) / total
        
        # Анализ черного углерода
        if 'BCSMASS' in day_data.columns:
            bc_thresholds = self.config.BLACK_CARBON_THRESHOLDS
            total = len(day_data)
            
            probs['black_carbon_clean'] = len(day_data[day_data['BCSMASS'] < bc_thresholds['clean']]) / total
            probs['black_carbon_low'] = len(day_data[(day_data['BCSMASS'] >= bc_thresholds['clean']) &
                                                      (day_data['BCSMASS'] < bc_thresholds['low'])]) / total
            probs['black_carbon_high'] = len(day_data[day_data['BCSMASS'] >= bc_thresholds['high']]) / total
        
        # Анализ пыли
        if 'DUSMASS' in day_data.columns:
            dust_thresholds = self.config.DUST_THRESHOLDS
            total = len(day_data)
            
            probs['dust_minimal'] = len(day_data[day_data['DUSMASS'] < dust_thresholds['minimal']]) / total
            probs['dust_low'] = len(day_data[(day_data['DUSMASS'] >= dust_thresholds['minimal']) &
                                             (day_data['DUSMASS'] < dust_thresholds['low'])]) / total
            probs['dust_high'] = len(day_data[(day_data['DUSMASS'] >= dust_thresholds['high']) &
                                              (day_data['DUSMASS'] < dust_thresholds['very_high'])]) / total
            probs['dust_storm'] = len(day_data[day_data['DUSMASS'] >= dust_thresholds['very_high']]) / total
        
        return probs
    
    def _analyze_thunderstorm_risk(self, day_data: pd.DataFrame) -> Dict:
        """
        Анализ риска грозы по CAPE (Convective Available Potential Energy)
        CAPE измеряется в J/kg
        """
        cape_col = None
        if 'cape' in day_data.columns:
            cape_col = 'cape'
        elif 'CAPE' in day_data.columns:
            cape_col = 'CAPE'
        
        if cape_col is None:
            return {}
        
        thresholds = self.config.THUNDERSTORM_THRESHOLDS
        total = len(day_data)
        
        return {
            'thunderstorm_none': len(day_data[day_data[cape_col] < thresholds['very_low']]) / total,
            'thunderstorm_very_low': len(day_data[(day_data[cape_col] >= thresholds['very_low']) &
                                                   (day_data[cape_col] < thresholds['low'])]) / total,
            'thunderstorm_low': len(day_data[(day_data[cape_col] >= thresholds['low']) &
                                             (day_data[cape_col] < thresholds['moderate'])]) / total,
            'thunderstorm_moderate': len(day_data[(day_data[cape_col] >= thresholds['moderate']) &
                                                  (day_data[cape_col] < thresholds['high'])]) / total,
            'thunderstorm_high': len(day_data[(day_data[cape_col] >= thresholds['high']) &
                                              (day_data[cape_col] < thresholds['very_high'])]) / total,
            'thunderstorm_very_high': len(day_data[(day_data[cape_col] >= thresholds['very_high']) &
                                                    (day_data[cape_col] < thresholds['extreme'])]) / total,
            'thunderstorm_extreme': len(day_data[day_data[cape_col] >= thresholds['extreme']]) / total,
        }
    
    @staticmethod
    def _day_to_date_string(day_of_year: int) -> str:
        """
        Конвертировать день года в строку с датой (пример для 2024)
        """
        date = datetime(2024, 1, 1) + pd.Timedelta(days=day_of_year - 1)
        return date.strftime('%B %d')
