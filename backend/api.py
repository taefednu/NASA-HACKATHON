"""
Flask API для анализа погодных условий
Предоставляет REST API эндпоинты для фронтенда
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
sys.path.append('..')

from weather_analysis import analyze_weather, analyze_multiple_dates
from weather_analysis.utils import export_to_json, export_to_csv
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для фронтенда

# Конфигурация
app.config['JSON_AS_ASCII'] = False  # Для поддержки unicode


@app.route('/', methods=['GET'])
def home():
    """Главная страница API"""
    return jsonify({
        'message': 'NASA Weather Probability API',
        'version': '1.0.0',
        'endpoints': {
            'GET /': 'API информация',
            'POST /api/analyze': 'Анализ погоды для даты и локации',
            'POST /api/analyze-multiple': 'Анализ для нескольких дат',
            'GET /api/health': 'Проверка работоспособности',
            'GET /api/export/<format>': 'Экспорт данных (csv/json)'
        }
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Проверка работоспособности API"""
    try:
        from weather_analysis import WeatherDataService
        
        # Проверяем доступность источников данных
        service = WeatherDataService()
        sources = service.test_connection()
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'data_sources': sources
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    Анализ погодных условий для конкретной даты и локации
    
    Request Body:
    {
        "latitude": 55.7558,
        "longitude": 37.6173,
        "date": "2024-06-15",
        "data_source": "nasa",  // optional, default: "nasa"
        "detailed": false        // optional, default: false
    }
    
    Response:
    {
        "location": {...},
        "date": "2024-06-15",
        "probabilities": {...},
        "statistics": {...},
        "metadata": {...}
    }
    """
    try:
        data = request.get_json()
        
        # Валидация обязательных полей
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        required_fields = ['latitude', 'longitude', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Извлекаем параметры
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
        date = data['date']
        data_source = data.get('data_source', 'nasa')
        detailed = data.get('detailed', False)
        
        # Валидация координат
        if not (-90 <= latitude <= 90):
            return jsonify({'error': 'Invalid latitude. Must be between -90 and 90'}), 400
        
        if not (-180 <= longitude <= 180):
            return jsonify({'error': 'Invalid longitude. Must be between -180 and 180'}), 400
        
        # Валидация даты
        try:
            datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Выполняем анализ
        result = analyze_weather(
            latitude=latitude,
            longitude=longitude,
            date=date,
            data_source=data_source,
            detailed=detailed
        )
        
        # Проверяем на ошибки
        if 'error' in result:
            return jsonify(result), 500
        
        return jsonify(result), 200
        
    except ValueError as e:
        return jsonify({'error': f'Invalid input: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze-multiple', methods=['POST'])
def analyze_multiple():
    """
    Анализ для нескольких дат
    
    Request Body:
    {
        "latitude": 55.7558,
        "longitude": 37.6173,
        "dates": ["2024-06-15", "2024-07-01", "2024-08-10"],
        "data_source": "nasa"  // optional
    }
    
    Response:
    {
        "location": {...},
        "results": [...]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        required_fields = ['latitude', 'longitude', 'dates']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
        dates = data['dates']
        data_source = data.get('data_source', 'nasa')
        
        if not isinstance(dates, list) or len(dates) == 0:
            return jsonify({'error': 'dates must be a non-empty array'}), 400
        
        # Выполняем анализ
        results = analyze_multiple_dates(
            latitude=latitude,
            longitude=longitude,
            dates=dates,
            data_source=data_source
        )
        
        return jsonify({
            'location': {
                'latitude': latitude,
                'longitude': longitude
            },
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/export/<format_type>', methods=['POST'])
def export_data(format_type):
    """
    Экспорт результатов анализа в CSV или JSON
    
    URL: /api/export/csv или /api/export/json
    
    Request Body: такой же как для /api/analyze
    """
    if format_type not in ['csv', 'json']:
        return jsonify({'error': 'Invalid format. Use csv or json'}), 400
    
    try:
        data = request.get_json()
        
        # Выполняем анализ
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
        date = data['date']
        
        result = analyze_weather(
            latitude=latitude,
            longitude=longitude,
            date=date,
            data_source=data.get('data_source', 'nasa')
        )
        
        if 'error' in result:
            return jsonify(result), 500
        
        # Создаем имя файла
        filename = f"weather_analysis_{latitude}_{longitude}_{date}.{format_type}"
        filepath = os.path.join('./data/exports', filename)
        
        # Создаем директорию если не существует
        os.makedirs('./data/exports', exist_ok=True)
        
        # Экспортируем
        if format_type == 'csv':
            export_to_csv(result, filepath)
        else:
            export_to_json(result, filepath)
        
        return jsonify({
            'message': 'Data exported successfully',
            'filename': filename,
            'filepath': filepath
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


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
    port = int(os.environ.get('API_PORT', 5000))
    debug = os.environ.get('DEBUG', 'true').lower() == 'true'
    
    print(f"""
    ╔══════════════════════════════════════════════════════════╗
    ║                                                          ║
    ║        NASA Weather Probability API                     ║
    ║        Version 1.0.0                                     ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝
    
    🚀 Server running on: http://localhost:{port}
    📚 API Docs: http://localhost:{port}/
    🔍 Health Check: http://localhost:{port}/api/health
    
    Press Ctrl+C to stop
    """)
    
    app.run(host='0.0.0.0', port=port, debug=debug)
