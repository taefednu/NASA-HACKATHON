# 🌦️ NASA Weather Probability Prediction System

> **NASA Space Apps Challenge 2024**  
> A sophisticated weather analysis system powered by 34+ years of NASA POWER historical data

## ⚠️ Development Status

**🚧 ACTIVE DEVELOPMENT** - Project started October 4th, 2025 (24 hours ago!)

- ✅ **Backend API**: Fully functional with 20 weather categories and 64 conditions
- ✅ **Data Processing**: Complete with NASA POWER integration and intelligent caching
- ✅ **Statistical Engine**: Advanced probability calculations working perfectly
- 🚧 **Frontend Interface**: Currently in development - **Will be fully ready for the presentation!**
- ✅ **Documentation**: Complete API docs, guides, and examples

**Note**: This is a hackathon project developed in **under 48 hours**, not a months-long effort. Despite the short timeframe, we've built a production-ready backend with comprehensive weather analysis capabilities.

---

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1.2-green.svg)](https://flask.palletsprojects.com/)
[![NASA POWER](https://img.shields.io/badge/Data-NASA%20POWER-orange.svg)](https://power.larc.nasa.gov/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Development Timeline](#-development-timeline)
- [Key Features](#-key-features)
- [Weather Categories & Variables](#-weather-categories--variables)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Usage Examples](#-usage-examples)
- [Data Sources](#-data-sources)
- [Project Structure](#-project-structure)

---

## 🎯 Overview

The **NASA Weather Probability Prediction System** is an advanced weather forecasting platform that leverages **34+ years** (1990-2023) of NASA POWER historical data to provide **probabilistic weather predictions** for any location on Earth.

### 💡 The Problem

Traditional weather forecasts provide single-point predictions which don't account for historical variability. Farmers, event planners, and decision-makers need to understand the **range of possible outcomes** and their probabilities.

### ✨ Our Solution

A probabilistic forecasting system that:
- Analyzes **34+ years** of historical weather data for any given date
- Calculates probability distributions for **20 weather categories** across **64 different conditions**
- Provides both **detailed** and **summary** views for different use cases
- Supports **multiple data sources** with intelligent consensus algorithms
- Delivers predictions via RESTful API and interactive web interface

---

## 🕐 Development Timeline

**October 4, 2025 (Day 1):**
- ✅ Project initialization
- ✅ NASA POWER API integration
- ✅ Core statistical analysis engine
- ✅ Initial data caching system

**October 5, 2025 (Day 2 - Today):**
- ✅ Added 3 new weather features (Dew Point, Wind Direction, Visibility)
- ✅ Restructured API response for frontend optimization
- ✅ Complete documentation suite
- ✅ 109 unit tests passing
- 🚧 Frontend development (in progress)

**Before Presentation:**
- 🎯 Complete frontend interface
- 🎯 Deploy live demo
- 🎯 Record video presentation

---

## 🚀 Key Features

### 1. **Comprehensive Weather Analysis**
- **20 Weather Categories**: Temperature, Precipitation, Wind Speed, Wind Direction, Humidity, Cloudiness, UV Index, Solar Radiation, Atmospheric Pressure, Snow, Dew Point, Visibility, Apparent Temperature, Wind Gusts, Weather Codes, Air Quality, Black Carbon, Dust, Thunderstorm Risk, Comfort Index
- **64 Distinct Conditions**: Complete coverage of weather phenomena

### 2. **Dual-Mode API**
- **Summary Mode** (`detailed=false`): 
  - 8 main weather blocks with all category probabilities
  - 12 additional features showing only the most likely condition
  - Optimized for user-friendly displays
- **Detailed Mode** (`detailed=true`): 
  - All 64 weather conditions with full probability distributions
  - Complete statistical analysis
  - Ideal for research and in-depth analysis

### 3. **Intelligent Data Processing**
- **Multi-source integration**: NASA POWER, Open-Meteo, GES DISC, CPTEC
- **Smart caching**: Parquet-based storage for fast access
- **Weighted interpolation**: Accurate predictions between grid points
- **Quality validation**: Automatic outlier detection

---

## 🌡️ Weather Categories & Variables

### Output Structure

The API returns data in two modes:

#### Summary Mode (detailed=false)

**1. Main Features (8 blocks)** - Shows ALL category probabilities:

| Feature | Categories | Description |
|---------|-----------|-------------|
| **Temperature** | very_cold, cold, cool, comfortable, warm, hot, very_hot | Air temperature categories (°C) |
| **Precipitation** | dry, light_rain, moderate_rain, heavy_rain, very_wet | Rainfall amount (mm) |
| **Wind Speed** | calm, light_breeze, moderate_wind, strong_wind, very_windy | Wind speed (m/s) |
| **Cloudiness** | clear, partly_cloudy, mostly_cloudy, overcast | Cloud cover (%) |
| **UV Index** | low_uv, moderate_uv, high_uv, very_high_uv, extreme_uv | UV radiation level |
| **Pressure** | low_pressure, normal_pressure, high_pressure | Atmospheric pressure (kPa) |
| **Comfort** | comfortable_comfort, slightly_uncomfortable, uncomfortable, very_uncomfortable | Human comfort index |
| **Snow** | no_snow, light_snow, moderate_snow, heavy_snow | Snow amount (mm) |

**2. Additional Features (12 features)** - Shows ONLY the most probable category:

| Feature | Possible Categories | Description |
|---------|-------------------|-------------|
| **Apparent Temperature** | feels_very_cold, feels_cold, feels_cool, feels_comfortable, feels_warm, feels_hot, feels_very_hot | How temperature feels with wind/humidity |
| **Dew Point** | dew_very_dry, dew_dry, dew_comfortable, dew_humid, dew_muggy, dew_oppressive, dew_extreme | Humidity comfort level (°C) |
| **Humidity** | very_dry_air, dry_air, normal_humidity, humid, very_humid | Relative humidity (%) |
| **Wind Direction** | wind_north, wind_northeast, wind_east, wind_southeast, wind_south, wind_southwest, wind_west, wind_northwest | Compass direction |
| **Wind Gusts** | no_gusts, light_gusts, moderate_gusts, strong_gusts, severe_gusts | Peak wind speed (m/s) |
| **Solar Radiation** | no_solar, low_solar, moderate_solar, high_solar, very_high_solar | Sunlight intensity (W/m²) |
| **Visibility** | very_poor_visibility, poor_visibility, moderate_visibility, good_visibility, excellent_visibility | Atmospheric clarity (km) |
| **Weather Codes** | clear_weather, partly_cloudy_weather, cloudy_weather, rain_weather, snow_weather, thunderstorm_weather, fog_weather | General conditions |
| **Air Quality** | good_air, moderate_air, unhealthy_sensitive, unhealthy_air, very_unhealthy_air, hazardous_air | AQI levels |
| **Black Carbon** | low_bc, moderate_bc, high_bc, very_high_bc | Soot concentration (μg/m³) |
| **Dust** | low_dust, moderate_dust, high_dust, very_high_dust | Particulate matter (μg/m³) |
| **Thunderstorm Risk** | no_storm_risk, low_storm_risk, moderate_storm_risk, high_storm_risk, extreme_storm_risk | Lightning probability |

#### Detailed Mode (detailed=true)

Returns all 64 weather conditions in a flat structure with their probabilities.

### Category Thresholds

**Temperature (T2M)**
- very_cold: < -10°C
- cold: -10 to 10°C
- cool: 10 to 18°C
- comfortable: 18 to 26°C
- warm: 26 to 30°C
- hot: 30 to 35°C
- very_hot: > 35°C

**Precipitation (PRECTOTCORR)**
- dry: < 0.1 mm
- light_rain: 0.1 to 2.5 mm
- moderate_rain: 2.5 to 10 mm
- heavy_rain: 10 to 50 mm
- very_wet: > 50 mm

**Wind Speed (WS2M)**
- calm: < 1 m/s
- light_breeze: 1 to 3 m/s
- moderate_wind: 3 to 7 m/s
- strong_wind: 7 to 12 m/s
- very_windy: > 12 m/s

**Humidity (RH2M)**
- very_dry_air: < 30%
- dry_air: 30 to 50%
- normal_humidity: 50 to 65%
- humid: 65 to 80%
- very_humid: > 80%

**Dew Point (T2MDEW)**
- dew_very_dry: < -5°C
- dew_dry: -5 to 10°C
- dew_comfortable: 10 to 15°C
- dew_humid: 15 to 18°C
- dew_muggy: 18 to 21°C
- dew_oppressive: 21 to 24°C
- dew_extreme: > 24°C

**UV Index (calculated from solar radiation)**
- low_uv: 0-2 (Minimal danger)
- moderate_uv: 3-5 (Some protection needed)
- high_uv: 6-7 (Protection essential)
- very_high_uv: 8-10 (Extra protection needed)
- extreme_uv: 11+ (Maximum protection)

**Pressure (PS)**
- low_pressure: < 100.8 kPa
- normal_pressure: 100.8 to 101.8 kPa
- high_pressure: > 101.8 kPa

### Statistical Metrics

For each weather parameter, we provide:
- **mean**: Average value over historical period
- **min**: Minimum observed value
- **max**: Maximum observed value
- **std**: Standard deviation (variability)
- **percentile_10**: 10th percentile (low end of range)
- **percentile_90**: 90th percentile (high end of range)

---

## 🛠️ Technology Stack

### Backend
- **Python 3.11+**: Core language with type annotations
- **Flask 3.1.2**: RESTful API framework
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computations
- **SciPy**: Statistical analysis

### Data Storage
- **Parquet**: Efficient columnar format
- **Local caching**: Fast data access

### Data Sources
- **NASA POWER API**: Primary source (1984-present)
- **Open-Meteo API**: Additional data
- **Google Maps API**: Location services

---

## 📦 Installation

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/taefednu/NASA-HACKATHON.git
cd NASA-HACKATHON

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment (optional)
cp .env.example .env
# Edit .env to add API keys

# 5. Run server
export PYTHONPATH=$(pwd):$PYTHONPATH
python backend/api.py
```

Server starts on `http://localhost:5000` 🚀

---

## 📖 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Main Endpoint

**Analyze Weather**
```http
GET /api/analyze?lat=55.7558&lon=37.6173&date=2025-10-15&detailed=false
```

**Parameters:**
- `lat` (float, required): Latitude (-90 to 90)
- `lon` (float, required): Longitude (-180 to 180)
- `date` (string, required): Date in YYYY-MM-DD format
- `detailed` (boolean, optional): Return all 64 conditions (default: false)

**Response Example (Summary Mode):**
```json
{
  "location": {"latitude": 55.7558, "longitude": 37.6173},
  "date": "2025-10-15",
  "probabilities": {
    "cold": 0.265,
    "very_cold": 0.0,
    ...
  },
  "main_features": {
    "temperature": {
      "very_cold": 0.0,
      "cold": 0.265,
      "cool": 0.0,
      ...
    },
    "precipitation": {...},
    ...
  },
  "additional_features": {
    "humidity": {
      "category": "very_humid",
      "probability": 0.912,
      "description": "Very high humidity"
    },
    ...
  },
  "statistics": {
    "temperature": {
      "mean": 4.63,
      "min": -5.32,
      "max": 17.38,
      "std": 3.77
    },
    ...
  }
}
```

Complete API documentation: [docs/API.md](docs/API.md)

---

## 💻 Usage Examples

### Python
```python
import requests

response = requests.get(
    'http://localhost:5000/api/analyze',
    params={'lat': 55.7558, 'lon': 37.6173, 'date': '2025-10-15'}
)
data = response.json()
print(f"Temperature: {data['statistics']['temperature']['mean']}°C")
```

### cURL
```bash
curl "http://localhost:5000/api/analyze?lat=55.7558&lon=37.6173&date=2025-10-15"
```

More examples: [examples/example_usage.py](examples/example_usage.py)

---

## 🗂️ Data Sources

### NASA POWER (Primary)
- **Coverage**: Global, 1984-present
- **Resolution**: 0.5° × 0.5° (~55km)
- **Parameters**: Temperature, Precipitation, Wind, Humidity, Solar Radiation, Pressure, and more
- **URL**: https://power.larc.nasa.gov/

### Open-Meteo (Secondary)
- **Coverage**: Global
- **Parameters**: High-resolution forecasts, weather codes
- **URL**: https://open-meteo.com

---

## 📁 Project Structure

```
NASA-HACKATHON/
├── backend/
│   └── api.py                 # Flask REST API
├── frontend/
│   └── index.html             # Web interface (in development)
├── weather_analysis/
│   ├── __init__.py            # Public API
│   ├── config.py              # Thresholds & settings
│   ├── data_service.py        # Data management
│   ├── statistical_analyzer.py # Probability engine
│   └── utils.py               # Helper functions
├── data/cache/                # Parquet cache files
├── tests/                     # Unit tests (109 passing)
├── docs/                      # Documentation
├── README.md                  # This file
└── requirements.txt           # Dependencies
```

---

## 🧪 Testing

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=weather_analysis

# All 109 tests passing ✅
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

- **NASA POWER Team** for historical weather data
- **NASA Space Apps Challenge** organizers
- **Open-Meteo** for additional APIs
- Open-source community

---

## 📞 Contact

- **Repository**: https://github.com/taefednu/NASA-HACKATHON
- **Issues**: https://github.com/taefednu/NASA-HACKATHON/issues

---

## 🌟 Star Us!

If you find this project useful, please ⭐ star us on GitHub!

---

**Built with ❤️ in 48 hours for NASA Space Apps Challenge 2024**
