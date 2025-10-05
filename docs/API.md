# API Documentation

Complete API reference for the NASA Weather Probability Prediction System.

## Base URL

```
http://localhost:5000/api
```

For production deployments, replace `localhost:5000` with your domain.

---

## Authentication

Currently, the API does not require authentication. For production use, consider implementing API keys or OAuth.

---

## Endpoints

### 1. Health Check

Check if the API is running and healthy.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2025-10-05T16:00:00Z"
}
```

**Status Codes:**
- `200 OK`: API is healthy
- `500 Internal Server Error`: API is experiencing issues

---

### 2. Analyze Weather (Single Date)

Get weather probability predictions for a specific location and date.

**Endpoint:** `GET /api/analyze`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `lat` | float | **Yes** | - | Latitude in decimal degrees (-90 to 90) |
| `lon` | float | **Yes** | - | Longitude in decimal degrees (-180 to 180) |
| `date` | string | **Yes** | - | Date in YYYY-MM-DD format |
| `detailed` | boolean | No | `false` | If `true`, returns all 64 weather conditions |
| `use_multi_source` | boolean | No | `false` | If `true`, combines data from multiple sources |
| `units` | string | No | `metric` | Unit system: `metric`, `imperial`, or `si` |

**Example Request:**
```bash
curl "http://localhost:5000/api/analyze?lat=55.7558&lon=37.6173&date=2025-10-15&detailed=false"
```

**Response (Summary Mode - detailed=false):**

```json
{
  "location": {
    "latitude": 55.7558,
    "longitude": 37.6173
  },
  "date": "2025-10-15",
  "day_of_year": 288,
  "date_name": "October 14",
  
  "probabilities": {
    "very_cold": 0.0,
    "cold": 0.2647058823529412,
    "comfortable": 0.0,
    "hot": 0.0,
    "very_hot": 0.0,
    "very_wet": 0.0,
    "very_windy": 0.0,
    "very_uncomfortable": 0.0
  },
  
  "main_features": {
    "temperature": {
      "very_cold": 0.0,
      "cold": 0.2647058823529412,
      "cool": 0.0,
      "comfortable": 0.0,
      "warm": 0.0,
      "hot": 0.0,
      "very_hot": 0.0
    },
    "precipitation": {
      "dry": 0.14705882352941177,
      "light_rain": 0.23529411764705882,
      "moderate_rain": 0.0,
      "heavy_rain": 0.0,
      "very_wet": 0.0
    },
    "wind": {
      "calm": 0.0,
      "light_breeze": 0.0,
      "moderate_wind": 0.0,
      "strong_wind": 0.0,
      "very_windy": 0.0
    },
    "cloudiness": {
      "clear": 0.029411764705882353,
      "partly_cloudy": 0.0,
      "mostly_cloudy": 0.058823529411764705,
      "overcast": 0.38235294117647056
    },
    "uv_index": {
      "low_uv": 0.6764705882352942,
      "moderate_uv": 0.0,
      "high_uv": 0.0,
      "very_high_uv": 0.0,
      "extreme_uv": 0.0
    },
    "pressure": {
      "low_pressure": 0.6764705882352942,
      "normal_pressure": 0.29411764705882354,
      "high_pressure": 0.0
    },
    "comfort": {
      "comfortable_comfort": 0.0,
      "slightly_uncomfortable": 0.0,
      "uncomfortable": 0.0,
      "very_uncomfortable": 0.0
    },
    "snow": {
      "no_snow": 0.4411764705882353,
      "light_snow": 0.29411764705882354,
      "moderate_snow": 0.08823529411764706,
      "heavy_snow": 0.17647058823529413
    }
  },
  
  "additional_features": {
    "apparent_temperature": {
      "category": "feels_very_cold",
      "probability": 0.0,
      "description": "Feels Very Cold"
    },
    "dew_point": {
      "category": "dew_very_dry",
      "probability": 0.0,
      "description": "Dew Very Dry"
    },
    "humidity": {
      "category": "very_humid",
      "probability": 0.9117647058823529,
      "description": "Very high humidity"
    },
    "wind_direction": {
      "category": "wind_north",
      "probability": 0.0,
      "description": "Wind North"
    },
    "wind_gusts": {
      "category": "no_gusts",
      "probability": 0.0,
      "description": "No Gusts"
    },
    "solar_radiation": {
      "category": "low_solar",
      "probability": 0.08823529411764706,
      "description": "Low solar radiation"
    },
    "visibility": {
      "category": "very_poor_visibility",
      "probability": 0.0,
      "description": "Very Poor Visibility"
    },
    "weather_codes": {
      "category": "clear_weather",
      "probability": 0.0,
      "description": "Clear Weather"
    },
    "air_quality": {
      "category": "good_air",
      "probability": 0.0,
      "description": "Good Air"
    },
    "black_carbon": {
      "category": "low_bc",
      "probability": 0.0,
      "description": "Low Bc"
    },
    "dust": {
      "category": "low_dust",
      "probability": 0.0,
      "description": "Low Dust"
    },
    "thunderstorm_risk": {
      "category": "no_storm_risk",
      "probability": 0.0,
      "description": "No Storm Risk"
    }
  },
  
  "statistics": {
    "temperature": {
      "mean": 4.632437410487249,
      "min": -5.3228547013962295,
      "max": 17.378467748276734,
      "std": 3.765004026381777,
      "percentile_10": -0.06644030026021577,
      "percentile_90": 9.280898536793364
    },
    "precipitation": {
      "mean": 1.8760940925980987,
      "max": 8.124966991468117,
      "std": 2.565243372037383,
      "percentile_90": 6.132888883050756
    },
    "wind": {
      "mean": 3.179652112225418,
      "max": 5.841852145333757,
      "std": 1.018574811253245,
      "percentile_90": 4.3584332173651115
    },
    "humidity": {
      "mean": 89.23479866096542,
      "min": 77.0539983956082,
      "max": 96.54351468396915,
      "std": 5.019899500629254
    },
    "dew_point": {
      "mean": 2.961140877682234,
      "min": -6.119935397835668,
      "max": 11.472205752962015
    },
    "cloudiness": {
      "mean": 80.24995210448539,
      "min": 21.116161173210465,
      "max": 99.54651015345274
    },
    "uv_index": {
      "mean": 0.15128960437397176,
      "max": 0.26537766584381994,
      "percentile_90": 0.20697644857278735
    },
    "solar_radiation": {
      "mean": 1.2274783023660847,
      "max": 2.4895268445061234
    },
    "pressure": {
      "mean": 99.58599630876766,
      "min": 97.34657084682576,
      "max": 101.04913437816751,
      "std": 0.8800368355758411
    },
    "snow": {
      "mean": 4.063873472995311,
      "max": 17.33,
      "days_with_snow": 19
    },
    "wind_10m": {
      "mean": 4.730577208966224,
      "max": 8.432760653496008
    }
  },
  
  "metadata": {
    "data_source": "NASA POWER API (interpolation)",
    "years_analyzed": "1990-2023",
    "data_points": 12418,
    "analysis_type": "summary",
    "multi_source_enabled": false,
    "consensus_sources": []
  }
}
```

**Response (Detailed Mode - detailed=true):**

In detailed mode, the response includes all 64 weather conditions in the `probabilities` object, but excludes `main_features` and `additional_features`.

```json
{
  "location": { /* ... */ },
  "date": "2025-10-15",
  "probabilities": {
    "very_cold": 0.0,
    "cold": 0.265,
    "cool": 0.0,
    "comfortable": 0.0,
    "warm": 0.0,
    "hot": 0.0,
    "very_hot": 0.0,
    "feels_very_cold": 0.0,
    "feels_cold": 0.44,
    "feels_cool": 0.0,
    "feels_comfortable": 0.0,
    "feels_warm": 0.0,
    "feels_hot": 0.0,
    "feels_very_hot": 0.0,
    "dew_very_dry": 0.206,
    "dew_dry": 0.735,
    "dew_comfortable": 0.059,
    /* ... all 64 conditions ... */
  },
  "statistics": { /* ... */ },
  "metadata": { /* ... */ }
}
```

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Invalid parameters
- `500 Internal Server Error`: Server error

**Error Response:**
```json
{
  "error": "Invalid latitude. Must be between -90 and 90",
  "code": "INVALID_LATITUDE"
}
```

---

### 3. Analyze Multiple Dates

Get weather predictions for multiple dates in a single request.

**Endpoint:** `POST /api/analyze/batch`

**Request Body:**
```json
{
  "latitude": 55.7558,
  "longitude": 37.6173,
  "dates": [
    "2025-10-15",
    "2025-10-16",
    "2025-10-17"
  ],
  "data_source": "nasa_power"
}
```

**Response:**
```json
[
  {
    "date": "2025-10-15",
    "day_of_year": 288,
    "probabilities": { /* ... */ },
    "statistics": { /* ... */ }
  },
  {
    "date": "2025-10-16",
    "day_of_year": 289,
    "probabilities": { /* ... */ },
    "statistics": { /* ... */ }
  },
  {
    "date": "2025-10-17",
    "day_of_year": 290,
    "probabilities": { /* ... */ },
    "statistics": { /* ... */ }
  }
]
```

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Invalid request body
- `500 Internal Server Error`: Server error

---

### 4. Get Available Data Sources

Get a list of all available data sources and their information.

**Endpoint:** `GET /api/sources`

**Response:**
```json
{
  "sources": [
    {
      "id": "nasa_power",
      "name": "NASA POWER",
      "description": "Prediction Of Worldwide Energy Resources - Solar and meteorological data",
      "coverage": "Global",
      "resolution": "0.5° x 0.5°",
      "temporal_range": "1984-present",
      "parameters": [
        "T2M", "T2M_MAX", "T2M_MIN", "PRECTOTCORR", "WS2M", "WS10M",
        "WD2M", "WD10M", "RH2M", "T2MDEW", "PS", "CLOUD_AMT", "ALLSKY_SFC_SW_DWN"
      ]
    },
    {
      "id": "open_meteo_enhanced",
      "name": "Open-Meteo Enhanced",
      "description": "High-resolution weather forecasts and historical data",
      "coverage": "Global",
      "resolution": "Variable (1-90km)",
      "temporal_range": "2000-present",
      "parameters": [
        "temperature_2m", "precipitation", "weather_code", "wind_speed_10m",
        "wind_direction_10m", "relative_humidity_2m", "surface_pressure"
      ]
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Success

---

### 5. Get Google Maps API Key

Get the Google Maps API key for frontend integration.

**Endpoint:** `GET /api/google-maps-api-key`

**Response:**
```json
{
  "apiKey": "AIzaSyB..."
}
```

**Status Codes:**
- `200 OK`: Success
- `500 Internal Server Error`: API key not configured

---

## Weather Categories

### Main Features (8 blocks)

1. **Temperature**
   - `very_cold`: < -10°C
   - `cold`: -10°C to 10°C
   - `cool`: 10°C to 18°C
   - `comfortable`: 18°C to 26°C
   - `warm`: 26°C to 30°C
   - `hot`: 30°C to 35°C
   - `very_hot`: > 35°C

2. **Precipitation**
   - `dry`: < 0.1 mm
   - `light_rain`: 0.1-2.5 mm
   - `moderate_rain`: 2.5-10 mm
   - `heavy_rain`: 10-50 mm
   - `very_wet`: > 50 mm

3. **Wind Speed**
   - `calm`: < 1 m/s
   - `light_breeze`: 1-3 m/s
   - `moderate_wind`: 3-7 m/s
   - `strong_wind`: 7-12 m/s
   - `very_windy`: > 12 m/s

4. **Cloudiness**
   - `clear`: < 20%
   - `partly_cloudy`: 20-50%
   - `mostly_cloudy`: 50-80%
   - `overcast`: > 80%

5. **UV Index**
   - `low_uv`: 0-2
   - `moderate_uv`: 3-5
   - `high_uv`: 6-7
   - `very_high_uv`: 8-10
   - `extreme_uv`: > 11

6. **Atmospheric Pressure**
   - `low_pressure`: < 100.8 kPa
   - `normal_pressure`: 100.8-101.8 kPa
   - `high_pressure`: > 101.8 kPa

7. **Comfort Index**
   - `comfortable_comfort`: Ideal conditions
   - `slightly_uncomfortable`: Minor discomfort
   - `uncomfortable`: Moderate discomfort
   - `very_uncomfortable`: Severe discomfort

8. **Snow**
   - `no_snow`: 0 mm
   - `light_snow`: 0-2 mm
   - `moderate_snow`: 2-10 mm
   - `heavy_snow`: > 10 mm

### Additional Features (12 features)

Each feature returns only the most probable category with its probability and description:

1. **Apparent Temperature** - How temperature feels with wind/humidity
2. **Dew Point** - Humidity comfort level
3. **Humidity** - Air moisture level
4. **Wind Direction** - 8 compass directions (N, NE, E, SE, S, SW, W, NW)
5. **Wind Gusts** - Peak wind speeds
6. **Solar Radiation** - Sunlight intensity
7. **Visibility** - Atmospheric clarity
8. **Weather Codes** - General weather conditions
9. **Air Quality** - Pollution levels
10. **Black Carbon** - Soot concentration
11. **Dust** - Particulate matter
12. **Thunderstorm Risk** - Lightning probability

---

## Rate Limiting

Currently, there are no rate limits. For production use, consider implementing rate limiting based on IP address or API key.

**Recommended limits:**
- 100 requests per minute per IP
- 10,000 requests per day per API key

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_LATITUDE` | 400 | Latitude must be between -90 and 90 |
| `INVALID_LONGITUDE` | 400 | Longitude must be between -180 and 180 |
| `INVALID_DATE` | 400 | Date must be in YYYY-MM-DD format |
| `FUTURE_DATE` | 400 | Cannot analyze dates too far in the future |
| `DATA_NOT_AVAILABLE` | 404 | No data available for this location |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## Response Times

Typical response times:
- **First request** (cache miss): 2-5 seconds
- **Cached request**: 100-500ms
- **Batch requests**: ~1-2 seconds per date

---

## Best Practices

1. **Use caching**: The API caches data automatically, so repeated requests for the same location/date are fast
2. **Batch requests**: Use `/api/analyze/batch` for multiple dates to reduce overhead
3. **Use summary mode**: Set `detailed=false` (default) unless you need all 64 conditions
4. **Handle errors**: Always check for error responses and handle them gracefully
5. **Respect resources**: Avoid unnecessary requests; cache on your side when possible

---

## Support

For issues or questions:
- **GitHub Issues**: https://github.com/taefednu/NASA-HACKATHON/issues
- **Email**: [support email]

---

**Last Updated**: October 2025
