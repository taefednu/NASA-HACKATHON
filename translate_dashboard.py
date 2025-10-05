#!/usr/bin/env python3
"""
Массовый перевод Dashboard.tsx с русского на английский
"""

translations = {
    # Headers and labels
    "Долгота": "Longitude",
    "Индекс комфорта": "Comfort Index",
    "Выберите местоположение на карте": "Select location on map",
    "Температура": "Temperature",
    "Влажность": "Humidity",
    "Скорость ветра": "Wind Speed",
    "Качество воздуха": "Air Quality",
    "Осадков": "Precipitation",
    "Параметр": "Parameter",
    "Вероятность": "Probability",
    "Категория": "Category",
    
    # Weather card titles
    "Ощущается жарко": "Feels Uncomfortable",
    "Очень Жарко": "Very Hot",
    "Очень Холодно": "Very Cold",
    "Очень Ветрено": "Very Windy",
    "Очень Влажно": "Very Wet",
    
    # Descriptions
    "Вероятность дискомфорта (холод или душота)": "Probability of discomfort (cold or stuffy)",
    "Вероятность дискомфорта от жары (Heat Index)": "Probability of heat discomfort (Heat Index)",
    "Вероятность жары": "Probability of heat",
    "Вероятность холода": "Probability of cold",
    "Вероятность ветра >20м/с": "Probability of wind >20m/s",
    "Вероятность осадков >100мм": "Probability of precipitation >100mm",
    
    # Detailed table categories and parameters
    "💧 Осадки": "💧 Precipitation",
    "Сильный дождь": "Heavy Rain",
    "Умеренный дождь": "Moderate Rain",
    "Легкий дождь": "Light Rain",
    "Сухо": "Dry",
    
    "🌡️ Температура": "🌡️ Temperature",
    "Очень жарко": "Very Hot",
    "Жарко": "Hot",
    "Тепло": "Warm",
    "Комфортно": "Comfortable",
    "Прохладно": "Cool",
    "Холодно": "Cold",
    "Очень холодно": "Very Cold",
    
    "💨 Ветер": "💨 Wind",
    "Штиль": "Calm",
    "Легкий бриз": "Light Breeze",
    "Умеренный ветер": "Moderate Wind",
    "Сильный ветер": "Strong Wind",
    "Очень ветрено": "Very Windy",
    
    "☀️ УФ-индекс": "☀️ UV Index",
    "Экстремальный": "Extreme",
    "Очень высокий": "Very High",
    "Высокий": "High",
    "Умеренный": "Moderate",
    "Низкий": "Low",
    
    "☁️ Облачность": "☁️ Cloudiness",
    "Ясно": "Clear",
    "Переменная облачность": "Partly Cloudy",
    "Преимущественно облачно": "Mostly Cloudy",
    "Пасмурно": "Overcast",
    
    "🌬️ Давление": "🌬️ Pressure",
    "Низкое": "Low",
    "Нормальное": "Normal",
    "Высокое": "High",
    
    "❄️ Снег": "❄️ Snow",
    "Сильный снег": "Heavy Snow",
    "Умеренный снег": "Moderate Snow",
    "Легкий снег": "Light Snow",
    "Без снега": "No Snow",
    
    "👁️ Видимость": "👁️ Visibility",
    "Отличная": "Excellent",
    "Хорошая": "Good",
    "Умеренная": "Moderate",
    "Плохая": "Poor",
    "Очень плохая": "Very Poor",
    
    "💦 Точка росы": "💦 Dew Point",
    "Очень душно": "Very Oppressive",
    "Душно": "Oppressive",
    "Слегка душно": "Slightly Oppressive",
    "Комфортно": "Comfortable",
    "Сухо": "Dry",
    "Очень сухо": "Very Dry",
    
    "☀️ Солнечная радиация": "☀️ Solar Radiation",
    "Очень высокая": "Very High",
    "Высокая": "High",
    "Умеренная": "Moderate",
    "Низкая": "Low",
    
    "⛈️ Риск грозы": "⛈️ Thunderstorm Risk",
    "Нет риска": "No Risk",
    "Низкий риск": "Low Risk",
    "Умеренный риск": "Moderate Risk",
    "Высокий риск": "High Risk",
    
    # Charts and visualization
    "Динамика Температуры": "Temperature Dynamics",
    "Распределение Вероятностей": "Probability Distribution",
    "Тепловая карта": "Heat Map",
    "Линейный график": "Line Chart",
    "Столбчатая диаграмма": "Bar Chart",
    "Корреляция Параметров": "Parameter Correlation",
    "Исторические данные температуры с прогнозами и трендами": "Historical temperature data with forecasts and trends",
    "Источник: NASA POWER API • Период: 1990-2023": "Source: NASA POWER API • Period: 1990-2023",
    
    # Download section
    "Скачайте исторические данные о вероятности погоды для выбранной локации и диапазона дат.": "Download historical weather probability data for the selected location and date range.",
    "Экспорт CSV": "Export CSV",
    "Экспорт JSON": "Export JSON",
    "Экспорт Excel": "Export Excel",
    
    # Data sources section
    "Источники данных": "Data Sources",
    "Типы визуализации данных:": "Data Visualization Types:",
    "Временные ряды:": "Time Series:",
    "Динамика изменений метеопараметров": "Dynamics of meteorological parameters",
    "Распределения:": "Distributions:",
    "Статистический анализ вероятностей": "Statistical probability analysis",
    "Корреляции:": "Correlations:",
    "Взаимосвязи между факторами": "Relationships between factors",
    "Риск-анализ:": "Risk Analysis:",
    "Комплексная оценка угроз": "Comprehensive threat assessment",
}

def translate_file(input_path, output_path=None):
    """Translate Dashboard.tsx file"""
    if output_path is None:
        output_path = input_path
    
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Apply translations
    for russian, english in translations.items():
        content = content.replace(russian, english)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Translation complete! File saved to: {output_path}")
    print(f"Applied {len(translations)} translations")

if __name__ == "__main__":
    translate_file("/home/zerotwo/NASA/frontend/src/pages/Dashboard.tsx")
