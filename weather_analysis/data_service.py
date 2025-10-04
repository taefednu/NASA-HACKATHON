"""
Модуль для получения данных о погоде из различных источников
Поддерживает NASA POWER API и Open-Meteo (запасной вариант)
"""

import requests
import pandas as pd
import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Optional, Tuple
import hashlib
from .mock_data import MockWeatherDataSource


class WeatherDataSource:
    """Абстрактный класс для источников данных о погоде"""
    
    def get_historical_data(self, latitude: float, longitude: float, 
                           start_year: int, end_year: int) -> pd.DataFrame:
        """Получить исторические данные для локации"""
        raise NotImplementedError


class NASAPowerAPI(WeatherDataSource):
    """
    Источник данных NASA POWER API
    Документация: https://power.larc.nasa.gov/docs/
    """
    
    def __init__(self, cache_dir: str = "./data/cache"):
        # Используем daily endpoint для получения данных по дням
        self.base_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
    def _get_cache_key(self, latitude: float, longitude: float, 
                       start_year: int, end_year: int) -> str:
        """Создать ключ для кэша"""
        key_str = f"{latitude}_{longitude}_{start_year}_{end_year}"
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def _get_from_cache(self, cache_key: str) -> Optional[pd.DataFrame]:
        """Получить данные из кэша если есть"""
        cache_file = self.cache_dir / f"{cache_key}.parquet"
        
        if cache_file.exists():
            # Проверяем возраст кэша
            file_age = datetime.now() - datetime.fromtimestamp(cache_file.stat().st_mtime)
            if file_age.days < 30:  # Кэш действителен 30 дней
                try:
                    return pd.read_parquet(cache_file)
                except Exception as e:
                    print(f"Ошибка чтения кэша: {e}")
        
        return None
    
    def _save_to_cache(self, cache_key: str, data: pd.DataFrame):
        """Сохранить данные в кэш"""
        cache_file = self.cache_dir / f"{cache_key}.parquet"
        try:
            data.to_parquet(cache_file)
        except Exception as e:
            print(f"Ошибка сохранения кэша: {e}")
    
    def get_historical_data(self, latitude: float, longitude: float,
                           start_year: int = 1990, end_year: int = 2023) -> pd.DataFrame:
        """
        Получить исторические климатологические данные от NASA POWER
        
        Args:
            latitude: Широта (-90 до 90)
            longitude: Долгота (-180 до 180)
            start_year: Начальный год
            end_year: Конечный год
            
        Returns:
            DataFrame с данными по дням года (1-365)
        """
        # Проверяем кэш
        cache_key = self._get_cache_key(latitude, longitude, start_year, end_year)
        cached_data = self._get_from_cache(cache_key)
        
        if cached_data is not None:
            print(f"✓ Данные загружены из кэша")
            return cached_data
        
        # Параметры для запроса
        parameters = "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,WS2M,RH2M,PS,CLOUD_AMT"
        
        # Формируем URL для daily данных
        url = (
            f"{self.base_url}"
            f"?parameters={parameters}"
            f"&community=RE"
            f"&longitude={longitude}"
            f"&latitude={latitude}"
            f"&start={start_year}0101"
            f"&end={end_year}1231"
            f"&format=JSON"
        )
        
        print(f"🌍 Запрос данных от NASA POWER API...")
        print(f"   Локация: ({latitude}, {longitude})")
        print(f"   Период: {start_year}-{end_year}")
        
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Обработка данных
            df = self._process_nasa_data(data)
            
            # Сохраняем в кэш
            self._save_to_cache(cache_key, df)
            
            print(f"✓ Данные успешно получены ({len(df)} дней)")
            return df
            
        except requests.exceptions.Timeout:
            raise Exception("Таймаут при запросе к NASA API")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Ошибка при запросе к NASA API: {e}")
        except Exception as e:
            raise Exception(f"Ошибка обработки данных: {e}")
    
    def _process_nasa_data(self, raw_data: dict) -> pd.DataFrame:
        """Обработать сырые данные от NASA в DataFrame"""
        try:
            parameters = raw_data['properties']['parameter']
            
            # NASA daily API возвращает данные в формате {YYYYMMDD: value}
            # Собираем все записи в один DataFrame
            
            all_records = {}
            
            for param_name, param_values in parameters.items():
                for date_str, value in param_values.items():
                    if value == -999.0:  # NASA fill value для missing data
                        continue
                    
                    if date_str not in all_records:
                        # Парсим дату
                        year = int(date_str[:4])
                        month = int(date_str[4:6])
                        day = int(date_str[6:8])
                        
                        date = pd.Timestamp(year=year, month=month, day=day)
                        
                        all_records[date_str] = {
                            'date': date,
                            'year': year,
                            'day_of_year': date.dayofyear
                        }
                    
                    all_records[date_str][param_name] = value
            
            # Создаем DataFrame - СОХРАНЯЕМ все годы отдельно
            df = pd.DataFrame(list(all_records.values()))
            
            return df
            
        except KeyError as e:
            raise Exception(f"Неожиданный формат данных от NASA: {e}")


class OpenMeteoAPI(WeatherDataSource):
    """
    Запасной источник данных Open-Meteo
    Документация: https://open-meteo.com/
    """
    
    def __init__(self, cache_dir: str = "./data/cache"):
        self.base_url = "https://archive-api.open-meteo.com/v1/archive"
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
    
    def get_historical_data(self, latitude: float, longitude: float,
                           start_year: int = 1990, end_year: int = 2023) -> pd.DataFrame:
        """
        Получить исторические данные от Open-Meteo
        
        Note: Open-Meteo возвращает данные по дням, а не климатологию
        Нужно агрегировать по дням года самостоятельно
        """
        print(f"🌍 Запрос данных от Open-Meteo API...")
        print(f"   Локация: ({latitude}, {longitude})")
        print(f"   Период: {start_year}-{end_year}")
        
        all_data = []
        
        # Open-Meteo ограничивает запросы по годам
        for year in range(start_year, end_year + 1):
            start_date = f"{year}-01-01"
            end_date = f"{year}-12-31"
            
            params = {
                'latitude': latitude,
                'longitude': longitude,
                'start_date': start_date,
                'end_date': end_date,
                'daily': 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,'
                        'precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean',
                'timezone': 'auto'
            }
            
            try:
                response = requests.get(self.base_url, params=params, timeout=30)
                response.raise_for_status()
                data = response.json()
                
                # Парсим данные
                daily = data['daily']
                df_year = pd.DataFrame({
                    'date': pd.to_datetime(daily['time']),
                    'T2M_MAX': daily['temperature_2m_max'],
                    'T2M_MIN': daily['temperature_2m_min'],
                    'T2M': daily['temperature_2m_mean'],
                    'PRECTOTCORR': daily['precipitation_sum'],
                    'WS2M': daily['wind_speed_10m_max'],
                    'RH2M': daily['relative_humidity_2m_mean']
                })
                
                all_data.append(df_year)
                
            except Exception as e:
                print(f"⚠ Ошибка для {year}: {e}")
                continue
        
        if not all_data:
            raise Exception("Не удалось получить данные от Open-Meteo")
        
        # Объединяем все годы - НЕ агрегируем, оставляем как есть
        df = pd.concat(all_data, ignore_index=True)
        
        # Добавляем день года и год
        df['day_of_year'] = df['date'].dt.dayofyear
        df['year'] = df['date'].dt.year
        
        print(f"✓ Данные успешно получены и обработаны")
        return df


class WeatherDataService:
    """
    Главный сервис для получения данных о погоде
    Автоматически выбирает доступный источник
    """
    
    def __init__(self, preferred_source: str = 'nasa', cache_dir: str = "./data/cache", 
                 use_mock: bool = False):
        """
        Args:
            preferred_source: 'nasa', 'openmeteo', или 'mock'
            cache_dir: Директория для кэша
            use_mock: Использовать mock данные для тестирования
        """
        self.cache_dir = cache_dir
        
        # Инициализируем источники
        self.nasa = NASAPowerAPI(cache_dir=cache_dir)
        self.openmeteo = OpenMeteoAPI(cache_dir=cache_dir)
        self.mock = MockWeatherDataSource(cache_dir=cache_dir)
        
        self.preferred_source = preferred_source
        self.use_mock = use_mock
    
    def get_data(self, latitude: float, longitude: float,
                 start_year: int = 1990, end_year: int = 2023) -> Tuple[pd.DataFrame, str]:
        """
        Получить данные о погоде (пытается использовать NASA, если не получается - Open-Meteo, если и это не получается - Mock)
        
        Returns:
            Tuple[DataFrame, источник_данных]
        """
        # Если явно указано использовать mock
        if self.use_mock or self.preferred_source == 'mock':
            data = self.mock.get_historical_data(latitude, longitude, start_year, end_year)
            return data, 'Mock Data (для тестирования)'
        
        # Пытаемся получить от предпочитаемого источника
        if self.preferred_source == 'nasa':
            try:
                data = self.nasa.get_historical_data(latitude, longitude, start_year, end_year)
                return data, 'NASA POWER API'
            except Exception as e:
                print(f"⚠ NASA API недоступен: {e}")
                print(f"🔄 Переключаемся на Open-Meteo...")
                
                try:
                    data = self.openmeteo.get_historical_data(latitude, longitude, start_year, end_year)
                    return data, 'Open-Meteo API'
                except Exception as e2:
                    print(f"⚠ Open-Meteo также недоступен: {e2}")
                    print(f"🧪 Используем Mock данные для тестирования...")
                    data = self.mock.get_historical_data(latitude, longitude, start_year, end_year)
                    return data, 'Mock Data (для тестирования)'
        
        else:  # openmeteo
            try:
                data = self.openmeteo.get_historical_data(latitude, longitude, start_year, end_year)
                return data, 'Open-Meteo API'
            except Exception as e:
                print(f"⚠ Open-Meteo недоступен: {e}")
                print(f"🔄 Переключаемся на NASA...")
                
                try:
                    data = self.nasa.get_historical_data(latitude, longitude, start_year, end_year)
                    return data, 'NASA POWER API'
                except Exception as e2:
                    print(f"⚠ NASA также недоступен: {e2}")
                    print(f"🧪 Используем Mock данные для тестирования...")
                    data = self.mock.get_historical_data(latitude, longitude, start_year, end_year)
                    return data, 'Mock Data (для тестирования)'
    
    def test_connection(self) -> Dict[str, bool]:
        """Проверить доступность источников данных"""
        results = {}
        
        # Тест NASA
        try:
            test_data = self.nasa.get_historical_data(55.7558, 37.6173, 2020, 2021)
            results['NASA'] = True
        except:
            results['NASA'] = False
        
        # Тест Open-Meteo
        try:
            test_data = self.openmeteo.get_historical_data(55.7558, 37.6173, 2020, 2021)
            results['OpenMeteo'] = True
        except:
            results['OpenMeteo'] = False
        
        return results
