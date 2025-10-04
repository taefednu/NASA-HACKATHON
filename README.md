# 🌍 NASA Weather Probability Analysis

## NASA Hackathon Project - Weather Analysis Module

Модуль для анализа вероятностей погодных условий на основе исторических данных NASA. Предназначен для помощи пользователям в планировании активностей на свежем воздухе.

---

## 📋 Описание

Этот проект создан для NASA Space Apps Hackathon и решает задачу предоставления вероятностей различных погодных условий для выбранной локации и даты на основе исторических данных за последние 20-30 лет.

**НЕ прогноз погоды!** Это статистический анализ, который отвечает на вопрос: "Какова вероятность, что в этом месте и в это время года будет жарко/холодно/дождливо?"

---

## 🚀 Быстрый старт

### 1. Установка

```bash
# Клонируйте репозиторий
cd NASA

# Создайте виртуальное окружение
python3 -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate

# Установите зависимости
pip install -r requirements.txt
```

### 2. Базовое использование

```python
from weather_analysis import analyze_weather

# Анализ погоды для Москвы на 15 июня
result = analyze_weather(
    latitude=55.7558,
    longitude=37.6173,
    date='2024-06-15'
)

# Получаем вероятности
probs = result['probabilities']
print(f"Вероятность очень жаркой погоды: {probs['very_hot']*100:.1f}%")
```

### 3. Запуск API

```bash
cd backend
python api.py
```

API будет доступно по адресу `http://localhost:5000`

---

## 📊 Возможности

### ✨ Основные функции

- **Статистический анализ** погодных условий на основе исторических данных NASA
- **Расчет вероятностей** для 8 категорий погоды:
  - 🥶 Очень холодно
  - ❄️ Холодно
  - 😊 Комфортно
  - ☀️ Жарко
  - 🔥 Очень жарко
  - 💧 Очень влажно (сильные осадки)
  - 💨 Очень ветрено
  - 😓 Очень некомфортно (жара + влажность)

- **Использует относительные пороги** (перцентили для каждой локации) + абсолютные значения
- **Индекс комфорта** (Heat Index) - учитывает температуру + влажность
- **Два источника данных**: NASA POWER API (основной) и Open-Meteo (запасной)
- **Кэширование** результатов для ускорения повторных запросов
- **REST API** для интеграции с фронтендом
- **Экспорт результатов** в CSV/JSON

---

## 🏗️ Архитектура проекта

```
NASA/
├── weather_analysis/          # 🎯 ОСНОВНОЙ МОДУЛЬ
│   ├── __init__.py           # Главная функция analyze_weather()
│   ├── data_service.py       # Получение данных от NASA/Open-Meteo
│   ├── statistical_analyzer.py  # Статистический анализ
│   ├── config.py             # Пороги и настройки
│   └── utils.py              # Вспомогательные функции
│
├── backend/                   # API
│   └── api.py                # Flask REST API
│
├── data/                      # Данные и кэш
│   ├── cache/                # Кэш запросов к NASA
│   └── exports/              # Экспортированные результаты
│
├── notebooks/                 # Jupyter notebooks
│   └── 01_data_exploration.ipynb
│
├── examples/                  # Примеры использования
│   └── example_usage.py
│
├── requirements.txt          # Зависимости
└── README.md                # Документация
```

---

## 📖 Документация API

### Python функция

```python
from weather_analysis import analyze_weather

result = analyze_weather(
    latitude=55.7558,      # Широта (-90 до 90)
    longitude=37.6173,     # Долгота (-180 до 180)
    date='2024-06-15',     # Дата в формате YYYY-MM-DD
    data_source='nasa',    # 'nasa' или 'openmeteo'
    years_range=(1990, 2023),  # Период для анализа
    detailed=False         # True для детального анализа
)
```

**Возвращает:**

```python
{
    'location': {'latitude': 55.7558, 'longitude': 37.6173},
    'date': '2024-06-15',
    'day_of_year': 167,
    'probabilities': {
        'very_cold': 0.05,      # 5% вероятность
        'cold': 0.15,
        'comfortable': 0.40,
        'hot': 0.30,
        'very_hot': 0.10,
        'very_wet': 0.20,
        'very_windy': 0.15,
        'very_uncomfortable': 0.12
    },
    'statistics': {
        'temperature': {
            'mean': 18.5,
            'min': 8.2,
            'max': 28.7,
            ...
        },
        ...
    },
    'metadata': {
        'data_source': 'NASA POWER API',
        'years_analyzed': '1990-2023',
        'data_points': 30
    }
}
```

### REST API

#### POST `/api/analyze`

Анализ погоды для одной даты.

**Request:**

```json
{
    "latitude": 55.7558,
    "longitude": 37.6173,
    "date": "2024-06-15",
    "data_source": "nasa",  // optional
    "detailed": false       // optional
}
```

**Response:** См. выше структуру результата

#### POST `/api/analyze-multiple`

Анализ для нескольких дат.

**Request:**

```json
{
    "latitude": 55.7558,
    "longitude": 37.6173,
    "dates": ["2024-06-15", "2024-07-01", "2024-08-10"]
}
```

#### GET `/api/health`

Проверка работоспособности API и доступности источников данных.

---

## 🔧 Примеры использования

### Пример 1: Простой анализ

```python
from weather_analysis import analyze_weather

result = analyze_weather(55.7558, 37.6173, '2024-06-15')

# Результат автоматически выводится в консоль
```

### Пример 2: Анализ нескольких дат

```python
from weather_analysis import analyze_multiple_dates

dates = ['2024-06-15', '2024-07-01', '2024-08-10']
results = analyze_multiple_dates(55.7558, 37.6173, dates)

for r in results:
    print(f"{r['date']}: {r['probabilities']['very_hot']*100:.1f}% вероятность жары")
```

### Пример 3: Использование через API

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 55.7558,
    "longitude": 37.6173,
    "date": "2024-06-15"
  }'
```

### Пример 4: Экспорт результатов

```python
from weather_analysis import analyze_weather
from weather_analysis.utils import export_to_json, export_to_csv

result = analyze_weather(55.7558, 37.6173, '2024-06-15')

# Сохранить в JSON
export_to_json(result, 'results.json')

# Сохранить в CSV
export_to_csv(result, 'results.csv')
```

---

## 📊 Jupyter Notebooks

Для экспериментов и визуализации данных используйте Jupyter Lab:

```bash
# Активируйте venv
source venv/bin/activate

# Запустите Jupyter Lab
jupyter lab
```

Откройте `notebooks/01_data_exploration.ipynb` для интерактивного исследования данных.

---

## 🌐 Источники данных

### NASA POWER API (основной)

- **URL**: https://power.larc.nasa.gov/
- **Параметры**: Температура, осадки, ветер, влажность, давление, облачность
- **Период**: 1981 - настоящее время
- **Разрешение**: Климатология по дням года

### Open-Meteo API (запасной)

- **URL**: https://open-meteo.com/
- **Используется автоматически**, если NASA недоступен
- **Период**: 1940 - настоящее время

---

## 🔍 Как это работает

1. **Получение данных**: Модуль запрашивает исторические данные от NASA для указанных координат
2. **Кэширование**: Данные сохраняются локально для ускорения повторных запросов
3. **Статистический анализ**: 
   - Вычисляются перцентили (10-й, 25-й, 75-й, 90-й) для каждой локации
   - Комбинируются с абсолютными порогами
   - Рассчитываются индексы комфорта (Heat Index, Wind Chill)
4. **Расчет вероятностей**: Процент дней за исторический период, когда условия превышали пороги

---

## ⚙️ Настройка порогов

Пороги настраиваются в `weather_analysis/config.py`:

```python
TEMPERATURE_THRESHOLDS = {
    'very_hot': {
        'percentile': 90,  # 90-й перцентиль
        'absolute_min': 30  # или минимум 30°C
    },
    ...
}
```

---

## 🤝 Интеграция с фронтендом

### Вариант 1: Прямой импорт (если backend на Python)

```python
from weather_analysis import analyze_weather
result = analyze_weather(lat, lon, date)
```

### Вариант 2: REST API (универсальный)

```javascript
const response = await fetch('http://localhost:5000/api/analyze', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        latitude: 55.7558,
        longitude: 37.6173,
        date: '2024-06-15'
    })
});

const result = await response.json();
console.log(result.probabilities.very_hot);
```

---

## 🧪 Тестирование

```bash
# Активируйте venv
source venv/bin/activate

# Запустите пример
python examples/example_usage.py

# Или используйте Jupyter notebook
jupyter lab notebooks/01_data_exploration.ipynb
```

---

## 📦 Зависимости

- **requests** - HTTP запросы к API
- **pandas** - Обработка данных
- **numpy** - Математические вычисления
- **flask** - REST API
- **flask-cors** - CORS для фронтенда
- **scikit-learn** - ML модели (для будущих улучшений)
- **jupyterlab** - Интерактивные notebooks
- **matplotlib, seaborn** - Визуализация

---

## 🚧 Будущие улучшения

- [ ] ML модель для обнаружения трендов (глобальное потепление)
- [ ] Поддержка анализа диапазона дат (vacation planning)
- [ ] Более детальные индексы комфорта
- [ ] Кэш с TTL и автоматическое обновление
- [ ] WebSocket для real-time обновлений
- [ ] Docker контейнеризация

---

## 👥 Команда

NASA Hackathon Team

---

## 📄 Лицензия

MIT License

---

## 🙏 Благодарности

- NASA POWER API за предоставление данных
- Open-Meteo за запасной источник данных
- NASA Space Apps Hackathon за вдохновение

---

## 📞 Контакты

Для вопросов и предложений создайте issue в репозитории.

---

**Made with ❤️ for NASA Space Apps Hackathon 2024**
