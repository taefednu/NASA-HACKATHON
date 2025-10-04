"""
Статистический анализ погодных данных
Расчет вероятностей различных погодных условий
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
        
        # === ИНДЕКС КОМФОРТА ===
        if 'T2M' in day_data.columns and 'RH2M' in day_data.columns:
            comfort_probs = self._analyze_comfort(day_data)
            probabilities.update(comfort_probs)
        
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
    
    def _analyze_comfort(self, day_data: pd.DataFrame) -> Dict:
        """Анализ индекса комфорта (учитывает температуру + влажность)"""
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
    
    def _calculate_statistics(self, day_data: pd.DataFrame) -> Dict:
        """Рассчитать базовую статистику для всех параметров"""
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
        для удобного отображения пользователю
        """
        full_analysis = self.analyze_day(data, day_of_year, latitude)
        
        if 'error' in full_analysis:
            return full_analysis
        
        probs = full_analysis['probabilities']
        
        # Возвращаем только ключевые категории
        summary = {
            'very_cold': probs.get('very_cold', 0.0),
            'cold': probs.get('cold', 0.0),
            'comfortable': probs.get('comfortable', 0.0),
            'hot': probs.get('hot', 0.0),
            'very_hot': probs.get('very_hot', 0.0),
            'very_wet': probs.get('very_wet', 0.0),
            'very_windy': probs.get('very_windy', 0.0),
            'very_uncomfortable': probs.get('very_uncomfortable', 0.0)
        }
        
        return {
            'day_of_year': day_of_year,
            'date_example': full_analysis['date_example'],
            'probabilities': summary,
            'statistics': full_analysis['statistics']
        }
    
    @staticmethod
    def _day_to_date_string(day_of_year: int) -> str:
        """Конвертировать день года в строку с датой (пример для 2024)"""
        date = datetime(2024, 1, 1) + pd.Timedelta(days=day_of_year - 1)
        return date.strftime('%B %d')
