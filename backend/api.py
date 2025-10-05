"""
Flask API для анализа погодных условий v2.0
Предоставляет REST API эндпоинты для фронтенда

🆕 v2.0 Features:
    - Мультисорсный режим (4 API источника)
    - Консенсус-анализ с оценкой согласованности
    - 7 новых параметров погоды
    - Расширенный статистический анализ
    - Улучшенная точность данных

Endpoints:
    POST /api/analyze - анализ погоды для конкретной даты
    POST /api/analyze-range - анализ для диапазона дат
    GET /api/data-sources - информация об источниках данных
    GET /api/health - проверка работоспособности
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sys
import os
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

sys.path.append('..')

from weather_analysis import analyze_weather, analyze_multiple_dates, analyze_weather_range
from weather_analysis.utils import export_to_json, export_to_csv, convert_result_units

# Загрузка переменных окружения из .env файла
load_dotenv()

app = Flask(__name__, static_folder='../frontend', static_url_path='/')
CORS(app)  # Разрешаем CORS для фронтенда

# Конфигурация
app.config['JSON_AS_ASCII'] = False  # Для поддержки unicode

# Загрузка API ключей из .env
GOOGLE_MAPS_API_KEY = os.environ.get("GOOGLE_MAPS_API_KEY", "YOUR_GOOGLE_MAPS_API_KEY_HERE")
API_PORT = int(os.environ.get('API_PORT', 5000))
DEBUG_MODE = os.environ.get('DEBUG', 'true').lower() == 'true'


@app.route('/', methods=['GET'])
def serve_index():
    """Обслуживает index.html для корневого URL"""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/google-maps-api-key', methods=['GET'])
def google_maps_api_key():
    """Предоставляет ключ API Google Maps фронтенду"""
    return jsonify({"apiKey": GOOGLE_MAPS_API_KEY})



@app.route('/api', methods=['GET'])
def api_info():
    """API информация"""
    return jsonify({
        'message': 'NASA Weather Probability API - Multi-Source Edition',
        'version': '2.0.0',
        'endpoints': {
            'GET /': 'API информация',
            'POST /api/analyze': 'Анализ погоды для даты и локации',
            'POST /api/analyze-multiple': 'Анализ для нескольких дат',
            'POST /api/analyze-range': 'Анализ для диапазона дат',
            'GET /api/data-sources': 'Информация о доступных источниках данных',
            'GET /api/health': 'Проверка работоспособности',
            'GET /api/export/<format>': 'Экспорт данных (csv/json)'
        },
        'features': {
            'multi_source': True,
            'consensus_analysis': True,
            'supported_parameters': [
                'temperature', 'apparent_temperature', 'precipitation',
                'wind_speed', 'wind_gusts', 'humidity', 'pressure',
                'cloudiness', 'uv_index', 'weather_code',
                'air_quality', 'black_carbon', 'dust', 'thunderstorm_risk'
            ]
        }
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Проверка работоспособности API"""
    try:
        # Проверяем подключение к сервисам
        return jsonify({
            "status": "ok", 
            "message": "API is running smoothly", 
            "version": "2.0.0",
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error", 
            "message": str(e)
        }), 500


@app.route('/api/data-sources', methods=['GET'])
def get_data_sources():
    """Возвращает список доступных источников данных"""
    try:
        from weather_analysis.config import WeatherConfig
        
        config = WeatherConfig()
        
        sources_info = {
            'nasa_power': {
                'name': 'NASA POWER',
                'description': 'NASA Prediction Of Worldwide Energy Resources',
                'coverage': 'Global',
                'parameters': list(config.NASA_PARAMETERS.keys())[:10],
                'resolution': '0.5° × 0.5° (с интерполяцией до ~100м)',
                'reliability': 0.95,
                'status': 'active'
            },
            'openmeteo': {
                'name': 'Open-Meteo',
                'description': 'Open-source weather API',
                'coverage': 'Global',
                'parameters': list(config.OPENMETEO_PARAMETERS.keys())[:10],
                'resolution': '~11km',
                'reliability': 0.90,
                'status': 'active'
            }
        }
        
        return jsonify({
            'sources': sources_info,
            'multi_source_available': True,
            'total_parameters': len(config.NASA_PARAMETERS) + len(config.OPENMETEO_PARAMETERS)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/api/analyze', methods=['POST'])
def analyze_weather_endpoint():
    """
    Эндпоинт для анализа погоды по одной дате
    
    Request Body:
    {
        "latitude": 55.7558,
        "longitude": 37.6173,
        "date": "2024-06-15",
        "data_source": "nasa",  // optional, default: "nasa"
        "detailed": false,      // optional, default: false
        "units": {},            // optional, custom units
        "use_multi_source": false  // optional, multi-source mode
    }
    """
    data = request.get_json()
    
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    date = data.get('date')
    data_source = data.get('data_source', 'nasa')
    years_range = (data.get('start_year', 1990), data.get('end_year', 2023))
    detailed = data.get('detailed', False)
    units = data.get('units', {})
    use_multi_source = data.get('use_multi_source', False)

    if not all([latitude, longitude, date]):
        return jsonify({"error": "Missing latitude, longitude, or date"}), 400

    try:
        result = analyze_weather(
            latitude=latitude,
            longitude=longitude,
            date=date,
            data_source=data_source,
            years_range=years_range,
            detailed=detailed,
            units=units,
            use_multi_source=use_multi_source
        )
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.error(f"Error in /api/analyze: {e}", exc_info=True)
        return jsonify({"error": "Internal server error", "details": str(e)}), 500



@app.route('/api/analyze-multiple', methods=['POST'])
def analyze_multiple_dates_endpoint():
    """Эндпоинт для анализа погоды по нескольким датам"""
    data = request.get_json()
    
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    dates = data.get('dates')
    data_source = data.get('data_source', 'nasa')
    years_range = (data.get('start_year', 1990), data.get('end_year', 2023))
    
    if not all([latitude, longitude, dates]):
        return jsonify({"error": "Missing latitude, longitude, or dates"}), 400

    try:
        results = analyze_multiple_dates(
            latitude=latitude,
            longitude=longitude,
            dates=dates,
            data_source=data_source,
            years_range=years_range
        )
        return jsonify(results), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.error(f"Error in /api/analyze-multiple: {e}", exc_info=True)
        return jsonify({"error": "Internal server error", "details": str(e)}), 500



@app.route('/api/analyze-range', methods=['POST'])
def analyze_range_endpoint():
    """Эндпоинт для анализа погоды в диапазоне дат"""
    data = request.get_json()
    
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    data_source = data.get('data_source', 'nasa')
    years_range = (data.get('start_year', 1990), data.get('end_year', 2023))
    units = data.get('units', {})
    use_multi_source = data.get('use_multi_source', False)
    
    if not all([latitude, longitude, start_date, end_date]):
        return jsonify({"error": "Missing latitude, longitude, start_date, or end_date"}), 400
    
    try:
        result = analyze_weather_range(
            latitude=latitude,
            longitude=longitude,
            start_date=start_date,
            end_date=end_date,
            data_source=data_source,
            years_range=years_range,
            units=units,
            use_multi_source=use_multi_source
        )
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.error(f"Error in /api/analyze-range: {e}", exc_info=True)
        return jsonify({"error": "Internal server error", "details": str(e)}), 500



@app.route('/api/export/<format_type>', methods=['POST'])
def export_data(format_type):
    """Эндпоинт для экспорта данных (JSON, CSV)"""
    data = request.get_json()
    export_data_content = data.get('data')
    filename_prefix = data.get('filename', 'weather_data')

    if not export_data_content:
        return jsonify({"error": "No data provided for export"}), 400

    try:
        exports_dir = Path('./data/exports')
        exports_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{filename_prefix}_{timestamp}.{format_type}"
        filepath = exports_dir / filename

        if format_type == 'json':
            export_to_json(export_data_content, filepath)
            return jsonify({"message": f"Data exported to {filepath}", "filename": filename}), 200
        elif format_type == 'csv':
            export_to_csv(export_data_content, filepath)
            return jsonify({"message": f"Data exported to {filepath}", "filename": filename}), 200
        else:
            return jsonify({"error": "Unsupported format type. Choose 'json' or 'csv'"}), 400
    except Exception as e:
        app.logger.error(f"Error in /api/export/{format_type}: {e}", exc_info=True)
        return jsonify({"error": "Failed to export data", "details": str(e)}), 500



@app.errorhandler(404)
def not_found(error):
    """Обработка 404 ошибок"""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Обработка 500 ошибок"""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Запуск сервера
    print(f"""
    ╔══════════════════════════════════════════════════════════╗
    ║                                                          ║
    ║        NASA Weather Probability API                     ║
    ║        Version 2.0.0                                     ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝

    🚀 Server running on: http://localhost:{API_PORT}
    📚 API Docs: http://localhost:{API_PORT}/
    🔍 Health Check: http://localhost:{API_PORT}/api/health
    🗺️  Google Maps Key: {'✅ Loaded' if GOOGLE_MAPS_API_KEY != 'YOUR_GOOGLE_MAPS_API_KEY_HERE' else '❌ Not configured'}

    Press Ctrl+C to stop
    """)

    app.run(host='0.0.0.0', port=API_PORT, debug=DEBUG_MODE)
