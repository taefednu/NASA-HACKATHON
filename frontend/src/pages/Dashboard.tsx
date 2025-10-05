import { useState } from "react";
import * as React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import WeatherCard from "@/components/WeatherCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sun, Snowflake, Wind, Droplets, Frown, Search, MapPin, Calendar as CalendarIcon, Download, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown, Thermometer, Eye, Zap, Loader2, Navigation, Map as MapIcon } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateEnd, setDateEnd] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [showDetailedTable, setShowDetailedTable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: 'category' | 'parameter' | 'probability' | 'threshold' | 'description';
    direction: 'asc' | 'desc';
  } | null>(null);

  // Функция получения геолокации
  const handleGetMyLocation = () => {
    if ("geolocation" in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setLocation(""); // Очищаем название при получении координат
          setIsLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLoading(false);
        }
      );
    }
  };

  // Функция геокодинга (преобразование названия в координаты)
  const geocodeLocation = async (locationName: string): Promise<{lat: number, lon: number} | null> => {
    try {
      // Используем Nominatim OpenStreetMap API (бесплатный)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`,
        {
          headers: {
            'User-Agent': 'NASA-Weather-App'
          }
        }
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.length === 0) return null;
      
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Функция анализа погоды
  const handleAnalyze = async () => {
    let finalLat: number | null = null;
    let finalLon: number | null = null;

    // Проверяем: либо координаты, либо название локации
    if (latitude && longitude) {
      // Используем координаты напрямую
      finalLat = parseFloat(latitude);
      finalLon = parseFloat(longitude);
    } else if (location.trim()) {
      // Преобразуем название в координаты
      setIsLoading(true);
      const coords = await geocodeLocation(location.trim());
      setIsLoading(false);
      
      if (!coords) {
        alert(`Не удалось найти координаты для "${location}". Попробуйте ввести координаты вручную.`);
        return;
      }
      
      finalLat = coords.lat;
      finalLon = coords.lon;
      
      // Обновляем поля координат для отображения
      setLatitude(coords.lat.toFixed(6));
      setLongitude(coords.lon.toFixed(6));
    } else {
      alert("Пожалуйста, укажите локацию: введите название города или координаты (широта и долгота), либо выберите на карте");
      return;
    }

    if (!date) {
      alert("Пожалуйста, выберите дату");
      return;
    }

    setIsLoading(true);
    setShowMetrics(false);
    try {
      // Если dateEnd заполнена, используем диапазон, иначе один день
      const requestBody: any = {
        latitude: finalLat,
        longitude: finalLon,
        data_source: "nasa",
        detailed: true,
        use_multi_source: true,
        units: {
          temperature: unit === "C" ? "celsius" : "fahrenheit"
        }
      };

      if (dateEnd) {
        // Диапазон дат
        requestBody.date_start = format(date, "yyyy-MM-dd");
        requestBody.date_end = format(dateEnd, "yyyy-MM-dd");
      } else {
        // Один день
        requestBody.date = format(date, "yyyy-MM-dd");
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Weather data:", data);
      setWeatherData(data);
      setShowMetrics(true);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      alert("Ошибка при получении данных");
    } finally {
      setIsLoading(false);
    }
  };

  // Ключевые метрики погоды (из API statistics или дефолтные значения)
  const weatherMetrics = weatherData?.statistics ? {
    averageTemp: weatherData.statistics.temperature?.mean || 0,
    feelsLikeTemp: weatherData.statistics.apparent_temperature?.mean || weatherData.statistics.temperature?.mean || 0,
    airQuality: weatherData.statistics.air_quality?.aod_mean 
      ? Math.round(weatherData.statistics.air_quality.aod_mean * 100) 
      : 0,
    airQualityStatus: weatherData.statistics.air_quality?.level || "Нет данных" as const
  } : {
    averageTemp: 0,
    feelsLikeTemp: 0,
    airQuality: 0,
    airQualityStatus: "Нет данных" as const
  };

  // Функция для получения статуса качества воздуха по AOD
  const getAirQualityStatus = (value: number) => {
    // AOD (Aerosol Optical Depth) интерпретация
    if (value <= 0.1) return { status: 'Хорошо', color: 'green' };
    if (value <= 0.3) return { status: 'Умеренно', color: 'yellow' };
    if (value <= 0.5) return { status: 'Плохо', color: 'orange' };
    return { status: 'Опасно', color: 'red' };
  };

  // Вычисление индекса комфорта (0-100) на основе вероятностей
  const calculateComfortIndex = () => {
    if (!weatherData?.probabilities) return null;
    
    const probs = weatherData.probabilities;
    
    // Начинаем со 100 и вычитаем за негативные факторы
    let index = 100;
    
    // Температурные факторы
    index -= (probs.very_hot || 0) * 40;      // Очень жарко сильно снижает комфорт
    index -= (probs.hot || 0) * 20;           // Жарко
    index -= (probs.very_cold || 0) * 40;     // Очень холодно
    index -= (probs.cold || 0) * 15;          // Холодно
    
    // Осадки и ветер
    index -= (probs.very_wet || 0) * 30;      // Сильные осадки
    index -= (probs.heavy_rain || 0) * 25;    // Сильный дождь
    index -= (probs.very_windy || 0) * 20;    // Сильный ветер
    
    // Дискомфорт от влажности и жары
    index -= (probs.very_uncomfortable || 0) * 35;
    index -= (probs.hot_feels_like || 0) * 15;
    index -= (probs.very_hot_feels_like || 0) * 25;
    
    // Добавляем за комфортные условия
    index += (probs.comfortable || 0) * 10;
    
    // Ограничиваем диапазон 0-100
    return Math.max(0, Math.min(100, Math.round(index)));
  };

  const comfortIndex = calculateComfortIndex();

  // 5 ключевых погодных карточек с данными из API
  const weatherCards = weatherData?.probabilities ? [
    {
      title: "Ощущается жарко",
      probability: Math.round(((weatherData.probabilities.hot_feels_like || 0) + (weatherData.probabilities.very_hot_feels_like || 0)) * 100),
      description: `Вероятность дискомфорта от жары (Heat Index)`,
      icon: Sun,
      variant: "uncomfortable" as const,
    },
    {
      title: "Очень Жарко", 
      probability: Math.round((weatherData.probabilities.very_hot || 0) * 100),
      description: `Вероятность жары ${unit === "C" ? ">30°C" : ">86°F"} (>90-й перцентиль)`,
      icon: Sun,
      variant: "hot" as const,
    },
    {
      title: "Очень Холодно",
      probability: Math.round((weatherData.probabilities.very_cold || 0) * 100),
      description: `Вероятность холода ${unit === "C" ? "<0°C" : "<32°F"} (<10-й перцентиль)`,
      icon: Snowflake,
      variant: "cold" as const,
    },
    {
      title: "Очень Ветрено",
      probability: Math.round((weatherData.probabilities.very_windy || 0) * 100),
      description: "Вероятность ветра >20м/с",
      icon: Wind,
      variant: "windy" as const,
    },
    {
      title: "Очень Влажно",
      probability: Math.round((weatherData.probabilities.very_wet || 0) * 100),
      description: "Вероятность осадков >100мм",
      icon: Droplets,
      variant: "humid" as const,
    },
  ] : [
    {
      title: "Ощущается жарко",
      probability: 0,
      description: `Вероятность дискомфорта от жары (Heat Index)`,
      icon: Sun,
      variant: "uncomfortable" as const,
    },
    {
      title: "Очень Жарко", 
      probability: 0,
      description: `Вероятность жары ${unit === "C" ? ">30°C" : ">86°F"} (>90-й перцентиль)`,
      icon: Sun,
      variant: "hot" as const,
    },
    {
      title: "Очень Холодно",
      probability: 0,
      description: `Вероятность холода ${unit === "C" ? "<0°C" : "<32°F"} (<10-й перцентиль)`,
      icon: Snowflake,
      variant: "cold" as const,
    },
    {
      title: "Очень Ветрено",
      probability: 0,
      description: "Вероятность ветра >20м/с",
      icon: Wind,
      variant: "windy" as const,
    },
    {
      title: "Очень Влажно",
      probability: 0,
      description: "Вероятность осадков >100мм",
      icon: Droplets,
      variant: "humid" as const,
    },
  ];

  // Детальные данные для таблицы вероятностей (на основе NASA данных)
  const detailedProbabilities = weatherData?.probabilities ? [
    // === ВЫСОКАЯ РЕЛЕВАНТНОСТЬ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ===
    
    // Температура (самое важное)
    { 
      category: "🌡️ Температура", 
      parameter: "Очень жарко", 
      probability: Math.round((weatherData.probabilities.very_hot || 0) * 100),
      threshold: ">90-й перцентиль или >30°C",
      description: "Экстремально высокие температуры"
    },
    { 
      category: "🌡️ Температура", 
      parameter: "Жарко", 
      probability: Math.round((weatherData.probabilities.hot || 0) * 100),
      threshold: ">75-й перцентиль или >25°C",
      description: "Высокие температуры"
    },
    { 
      category: "🌡️ Температура", 
      parameter: "Комфортная температура", 
      probability: Math.round((weatherData.probabilities.comfortable || 0) * 100),
      threshold: "15-25°C",
      description: "Оптимальный температурный диапазон"
    },
    { 
      category: "🌡️ Температура", 
      parameter: "Холодно", 
      probability: Math.round((weatherData.probabilities.cold || 0) * 100),
      threshold: "<25-й перцентиль или <10°C",
      description: "Низкие температуры"
    },
    { 
      category: "🌡️ Температура", 
      parameter: "Очень холодно", 
      probability: Math.round((weatherData.probabilities.very_cold || 0) * 100),
      threshold: "<10-й перцентиль или <0°C",
      description: "Экстремально низкие температуры"
    },
    
    // Осадки (критично для планирования)
    { 
      category: "💧 Осадки", 
      parameter: "Очень влажно", 
      probability: Math.round((weatherData.probabilities.very_wet || 0) * 100),
      threshold: ">100мм",
      description: "Сильные ливни и грозы"
    },
    { 
      category: "💧 Осадки", 
      parameter: "Сильный дождь", 
      probability: Math.round((weatherData.probabilities.heavy_rain || 0) * 100),
      threshold: ">50мм",
      description: "Интенсивные осадки"
    },
    { 
      category: "💧 Осадки", 
      parameter: "Умеренный дождь", 
      probability: Math.round((weatherData.probabilities.moderate_rain || 0) * 100),
      threshold: "5-50мм",
      description: "Обычные дождевые осадки"
    },
    { 
      category: "💧 Осадки", 
      parameter: "Легкий дождь", 
      probability: Math.round((weatherData.probabilities.light_rain || 0) * 100),
      threshold: "0.1-5мм",
      description: "Моросящий дождь"
    },
    { 
      category: "💧 Осадки", 
      parameter: "Сухо", 
      probability: Math.round((weatherData.probabilities.dry || 0) * 100),
      threshold: "<0.1мм",
      description: "Отсутствие осадков"
    },
    
    // Ветер (важно для комфорта)
    { 
      category: "💨 Ветер", 
      parameter: "Очень ветрено", 
      probability: Math.round((weatherData.probabilities.very_windy || 0) * 100),
      threshold: ">20 м/с",
      description: "Штормовой ветер"
    },
    { 
      category: "💨 Ветер", 
      parameter: "Сильный ветер", 
      probability: Math.round((weatherData.probabilities.strong_wind || 0) * 100),
      threshold: "10-20 м/с",
      description: "Сильные порывы ветра"
    },
    { 
      category: "💨 Ветер", 
      parameter: "Умеренный ветер", 
      probability: Math.round((weatherData.probabilities.moderate_wind || 0) * 100),
      threshold: "5-10 м/с",
      description: "Обычная скорость ветра"
    },
    { 
      category: "💨 Ветер", 
      parameter: "Штиль", 
      probability: Math.round((weatherData.probabilities.calm || 0) * 100),
      threshold: "<2 м/с",
      description: "Слабый или отсутствующий ветер"
    },
    
    // Общий комфорт (Heat Index)
    { 
      category: "🏠 Комфорт", 
      parameter: "Очень некомфортно", 
      probability: Math.round((weatherData.probabilities.very_uncomfortable || 0) * 100),
      threshold: "Heat Index >40°C",
      description: "Опасный уровень жары с учетом влажности"
    },
    { 
      category: "🏠 Комфорт", 
      parameter: "Некомфортно", 
      probability: Math.round((weatherData.probabilities.uncomfortable || 0) * 100),
      threshold: "Heat Index 32-40°C",
      description: "Душная погода, дискомфорт"
    },
    { 
      category: "🏠 Комфорт", 
      parameter: "Комфортно", 
      probability: Math.round((weatherData.probabilities.comfortable_comfort || 0) * 100),
      threshold: "T: 18-24°C, влажность <70%",
      description: "Оптимальные условия для человека"
    },
    
    // === СРЕДНЯЯ РЕЛЕВАНТНОСТЬ (ИНТЕРЕСНЫЕ ДАННЫЕ) ===
    
    // UV индекс (здоровье кожи)
    { 
      category: "☀️ УФ-индекс", 
      parameter: "Экстремальный", 
      probability: Math.round((weatherData.probabilities.extreme_uv || 0) * 100),
      threshold: "UV >11",
      description: "Опасный уровень УФ-излучения"
    },
    { 
      category: "☀️ УФ-индекс", 
      parameter: "Очень высокий", 
      probability: Math.round((weatherData.probabilities.very_high_uv || 0) * 100),
      threshold: "UV 8-11",
      description: "Высокий риск солнечных ожогов"
    },
    { 
      category: "☀️ УФ-индекс", 
      parameter: "Высокий", 
      probability: Math.round((weatherData.probabilities.high_uv || 0) * 100),
      threshold: "UV 6-7",
      description: "Необходима защита от солнца"
    },
    { 
      category: "☀️ УФ-индекс", 
      parameter: "Умеренный", 
      probability: Math.round((weatherData.probabilities.moderate_uv || 0) * 100),
      threshold: "UV 3-5",
      description: "Умеренное УФ-излучение"
    },
    { 
      category: "☀️ УФ-индекс", 
      parameter: "Низкий", 
      probability: Math.round((weatherData.probabilities.low_uv || 0) * 100),
      threshold: "UV <3",
      description: "Безопасный уровень УФ"
    },
    
    // Облачность (визуальный комфорт)
    { 
      category: "☁️ Облачность", 
      parameter: "Ясно", 
      probability: Math.round((weatherData.probabilities.clear || 0) * 100),
      threshold: "<20% покрытия",
      description: "Безоблачное небо"
    },
    { 
      category: "☁️ Облачность", 
      parameter: "Малооблачно", 
      probability: Math.round((weatherData.probabilities.partly_cloudy || 0) * 100),
      threshold: "20-50% покрытия",
      description: "Переменная облачность"
    },
    { 
      category: "☁️ Облачность", 
      parameter: "Облачно", 
      probability: Math.round((weatherData.probabilities.mostly_cloudy || 0) * 100),
      threshold: "50-80% покрытия",
      description: "Преобладающая облачность"
    },
    { 
      category: "☁️ Облачность", 
      parameter: "Пасмурно", 
      probability: Math.round((weatherData.probabilities.overcast || 0) * 100),
      threshold: ">80% покрытия",
      description: "Сплошная облачность"
    },
    
    // Атмосферное давление (метеочувствительность)
    { 
      category: "🌀 Давление", 
      parameter: "Низкое", 
      probability: Math.round((weatherData.probabilities.low_pressure || 0) * 100),
      threshold: "<1000 гПа",
      description: "Циклон, возможны осадки"
    },
    { 
      category: "🌀 Давление", 
      parameter: "Нормальное", 
      probability: Math.round((weatherData.probabilities.normal_pressure || 0) * 100),
      threshold: "1000-1020 гПа",
      description: "Стабильные погодные условия"
    },
    { 
      category: "🌀 Давление", 
      parameter: "Высокое", 
      probability: Math.round((weatherData.probabilities.high_pressure || 0) * 100),
      threshold: ">1020 гПа",
      description: "Антициклон, ясная погода"
    },
    
    // Снег (сезонное)
    { 
      category: "❄️ Снег", 
      parameter: "Сильный снег", 
      probability: Math.round((weatherData.probabilities.heavy_snow || 0) * 100),
      threshold: ">10см глубина",
      description: "Обильный снегопад"
    },
    { 
      category: "❄️ Снег", 
      parameter: "Умеренный снег", 
      probability: Math.round((weatherData.probabilities.moderate_snow || 0) * 100),
      threshold: "2-10см глубина",
      description: "Средний снегопад"
    },
    { 
      category: "❄️ Снег", 
      parameter: "Легкий снег", 
      probability: Math.round((weatherData.probabilities.light_snow || 0) * 100),
      threshold: "<2см глубина",
      description: "Небольшой снег"
    },
    
    // === ДОПОЛНИТЕЛЬНЫЕ ДАННЫЕ (менее точные, внизу) ===
    
    // Точка росы (дискомфорт от влажности)
    { 
      category: "💦 Точка росы", 
      parameter: "Удушающе", 
      probability: Math.round((weatherData.probabilities.dew_oppressive || 0) * 100),
      threshold: ">24°C",
      description: "Крайне некомфортная влажность"
    },
    { 
      category: "💦 Точка росы", 
      parameter: "Душно", 
      probability: Math.round((weatherData.probabilities.dew_muggy || 0) * 100),
      threshold: "18-24°C",
      description: "Ощущение духоты"
    },
    { 
      category: "💦 Точка росы", 
      parameter: "Комфортно", 
      probability: Math.round((weatherData.probabilities.dew_comfortable || 0) * 100),
      threshold: "10-18°C",
      description: "Приятная влажность"
    },
    
    // Влажность воздуха
    { 
      category: "💨 Влажность", 
      parameter: "Очень влажно", 
      probability: Math.round((weatherData.probabilities.very_humid || 0) * 100),
      threshold: ">80%",
      description: "Высокая влажность воздуха"
    },
    { 
      category: "💨 Влажность", 
      parameter: "Влажно", 
      probability: Math.round((weatherData.probabilities.humid || 0) * 100),
      threshold: "60-80%",
      description: "Повышенная влажность"
    },
    { 
      category: "💨 Влажность", 
      parameter: "Нормально", 
      probability: Math.round((weatherData.probabilities.normal_humidity || 0) * 100),
      threshold: "40-60%",
      description: "Комфортная влажность"
    },
    { 
      category: "💨 Влажность", 
      parameter: "Сухо", 
      probability: Math.round((weatherData.probabilities.dry_air || 0) * 100),
      threshold: "<40%",
      description: "Пониженная влажность"
    },
  ] : [];

  // Функция сортировки
  const handleSort = (key: 'category' | 'parameter' | 'probability' | 'threshold' | 'description') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Получение иконки сортировки
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1" />
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  // Отсортированные данные
  const sortedProbabilities = React.useMemo(() => {
    if (!sortConfig) return detailedProbabilities;

    return [...detailedProbabilities].sort((a, b) => {
      const { key, direction } = sortConfig;
      
      let aValue = a[key];
      let bValue = b[key];
      
      // Для числовых значений
      if (key === 'probability') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [detailedProbabilities, sortConfig]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">Панель Анализа Погоды</h1>
            <p className="text-muted-foreground">
              Анализируйте вероятности экстремальной погоды с помощью данных наблюдения Земли NASA
            </p>
          </div>

          {/* Control Panel */}
          <div className="bg-card p-6 rounded-lg shadow-card border border-border mb-8 animate-slide-up">
            {/* First row */}
            <div className="grid gap-4 items-end mb-4" style={{gridTemplateColumns: "2fr 1fr 1fr 0.8fr"}}>
              <div>
                <label className="block text-sm font-medium mb-2">Локация</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Введите название города" 
                    className="pl-10"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      // Если вводим название, очищаем координаты
                      if (e.target.value.trim()) {
                        setLatitude("");
                        setLongitude("");
                      }
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Широта</label>
                <Input 
                  placeholder="Например: 55.7558" 
                  value={latitude}
                  onChange={(e) => {
                    setLatitude(e.target.value);
                    // Если вводим координаты, очищаем название
                    if (e.target.value.trim()) {
                      setLocation("");
                    }
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Дата</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ru }) : <span>Выберите дату</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="pointer-events-auto"
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Button 
                  variant="nasa" 
                  size="default" 
                  className={cn(
                    "w-full px-2 text-sm relative overflow-hidden transition-all",
                    isLoading && "animate-pulse"
                  )}
                  onClick={handleAnalyze}
                  disabled={isLoading || (!location.trim() && (!latitude || !longitude)) || !date}
                  style={{
                    background: isLoading 
                      ? 'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)'
                      : undefined,
                    backgroundSize: isLoading ? '200% 100%' : '100% 100%',
                    animation: isLoading ? 'shimmer 2s infinite' : 'none',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Анализ...
                    </>
                  ) : (
                    'Анализировать'
                  )}
                </Button>
              </div>
            </div>
            
            {/* Second row */}
            <div className="grid gap-4 items-end" style={{gridTemplateColumns: "2fr 1fr 1fr 0.8fr"}}>
              <div className="flex gap-2 items-end w-full">
                <Button 
                  variant="outline" 
                  className="flex-1 flex items-center justify-center text-sm px-1 flex-shrink-0"
                  onClick={handleGetMyLocation}
                  disabled={isLoading}
                >
                  <Navigation className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="whitespace-nowrap">Моя локация</span>
                </Button>
                
                <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 flex items-center justify-center text-sm px-1 flex-shrink-0">
                      <MapIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="whitespace-nowrap">На карте</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] max-h-[90vh] w-full p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                      <DialogTitle className="text-lg sm:text-2xl font-bold">Выберите местоположение на карте</DialogTitle>
                    </DialogHeader>
                    <motion.div 
                      className="h-[70vh] sm:h-[600px] w-full relative overflow-hidden rounded-b-lg"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <iframe
                        className="w-full h-full border-0"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${
                          latitude && longitude 
                            ? `${latitude},${longitude}` 
                            : '41.2995,69.2401'
                        }&zoom=10`}
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                        <Button 
                          onClick={() => {
                            if (latitude && longitude) {
                              setIsMapOpen(false);
                            } else {
                              // Устанавливаем координаты Ташкента по умолчанию
                              setLatitude("41.2995");
                              setLongitude("69.2401");
                              setLocation(""); // Очищаем название при выборе на карте
                              setIsMapOpen(false);
                            }
                          }}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
                          size="sm"
                        >
                          {latitude && longitude ? 'Закрыть' : 'Выбрать Ташкент'}
                        </Button>
                      </div>
                    </motion.div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant={unit === "C" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setUnit("C")}
                  className="w-10 h-10 px-1 text-xs flex-shrink-0 min-w-[2.5rem]"
                >
                  °C
                </Button>
                <Button 
                  variant={unit === "F" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setUnit("F")}
                  className="w-10 h-10 px-1 text-xs flex-shrink-0 min-w-[2.5rem]"
                >
                  °F
                </Button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Долгота</label>
                <Input 
                  placeholder="Например: 37.6173" 
                  value={longitude}
                  onChange={(e) => {
                    setLongitude(e.target.value);
                    // Если вводим координаты, очищаем название
                    if (e.target.value.trim()) {
                      setLocation("");
                    }
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Дата до</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateEnd && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateEnd ? format(dateEnd, "PPP", { locale: ru }) : <span>Не выбрано (один день)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateEnd}
                      onSelect={setDateEnd}
                      initialFocus
                      className="pointer-events-auto"
                      locale={ru}
                      disabled={(date) => date && date < (date || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Key Weather Metrics - Apple Weather Style - показываем только после анализа */}
          {showMetrics && (
            <motion.div 
              className="grid grid-cols-3 gap-4 mb-12"
              initial={{ opacity: 0, y: -30, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -30, height: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Average Temperature */}
              <motion.div 
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      ТЕМПЕРАТУРА
                    </div>
                    <Thermometer className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-4xl font-light text-gray-900 dark:text-white">
                      {Math.round(weatherMetrics.averageTemp)}
                    </span>
                    <span className="text-2xl font-light text-gray-500 dark:text-gray-400">
                      °{unit}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Средняя за период
                </div>
              </div>
            </motion.div>

            {/* Feels Like Temperature */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    ОЩУЩАЕТСЯ
                  </div>
                  <Eye className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-light text-gray-900 dark:text-white">
                    {Math.round(weatherMetrics.feelsLikeTemp)}
                  </span>
                  <span className="text-2xl font-light text-gray-500 dark:text-gray-400">
                    °{unit}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  С учетом влажности
                </div>
              </div>
            </motion.div>

            {/* Air Quality */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    КАЧЕСТВО ВОЗДУХА
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    weatherMetrics.airQuality <= 12 ? 'bg-green-500' :
                    weatherMetrics.airQuality <= 35 ? 'bg-yellow-500' :
                    weatherMetrics.airQuality <= 55 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`} />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-light text-gray-900 dark:text-white">
                    {weatherMetrics.airQuality}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 dark:text-gray-400 leading-none">
                      μg/m³
                    </span>
                    <span className={`text-sm font-medium leading-none mt-1 ${
                      weatherMetrics.airQuality <= 12 ? 'text-green-600 dark:text-green-400' :
                      weatherMetrics.airQuality <= 35 ? 'text-yellow-600 dark:text-yellow-500' :
                      weatherMetrics.airQuality <= 55 ? 'text-orange-600 dark:text-orange-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {weatherMetrics.airQuality <= 12 ? 'Хорошо' :
                       weatherMetrics.airQuality <= 35 ? 'Умеренно' :
                       weatherMetrics.airQuality <= 55 ? 'Плохо' :
                       'Опасно'}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  PM2.5 концентрация
                </div>
              </div>
            </motion.div>
          </motion.div>
          )}

          {/* Results Overview */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Обзор Вероятности Погоды
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Анализ погодных условий: ключевые метрики, индекс комфорта и вероятности экстремальных явлений на основе данных NASA
              </p>
            </div>

            {/* Comfort Index */}
            <div className={`rounded-lg p-6 mb-8 border transition-all duration-500 ${
              comfortIndex !== null && comfortIndex >= 80 ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800' :
              comfortIndex !== null && comfortIndex >= 60 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800' :
              comfortIndex !== null && comfortIndex >= 40 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-200 dark:border-yellow-800' :
              comfortIndex !== null ? 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border-red-200 dark:border-red-800' :
              'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 border-gray-200 dark:border-gray-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full transition-all duration-500 ${
                    comfortIndex !== null && comfortIndex >= 80 ? 'bg-green-500' :
                    comfortIndex !== null && comfortIndex >= 60 ? 'bg-blue-500' :
                    comfortIndex !== null && comfortIndex >= 40 ? 'bg-yellow-500' :
                    comfortIndex !== null ? 'bg-red-500' : 'bg-gray-500'
                  }`}>
                    <Sun className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold transition-colors duration-500 ${
                      comfortIndex !== null && comfortIndex >= 80 ? 'text-green-900 dark:text-green-100' :
                      comfortIndex !== null && comfortIndex >= 60 ? 'text-blue-900 dark:text-blue-100' :
                      comfortIndex !== null && comfortIndex >= 40 ? 'text-yellow-900 dark:text-yellow-100' :
                      comfortIndex !== null ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-gray-100'
                    }`}>Индекс Комфорта</h3>
                    <p className={`transition-colors duration-500 ${
                      comfortIndex !== null && comfortIndex >= 80 ? 'text-green-700 dark:text-green-300' :
                      comfortIndex !== null && comfortIndex >= 60 ? 'text-blue-700 dark:text-blue-300' :
                      comfortIndex !== null && comfortIndex >= 40 ? 'text-yellow-700 dark:text-yellow-300' :
                      comfortIndex !== null ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'
                    }`}>Общая оценка погодных условий</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold mb-1 transition-colors duration-500 ${
                    comfortIndex !== null && comfortIndex >= 80 ? 'text-green-600 dark:text-green-400' :
                    comfortIndex !== null && comfortIndex >= 60 ? 'text-blue-600 dark:text-blue-400' :
                    comfortIndex !== null && comfortIndex >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                    comfortIndex !== null ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {comfortIndex !== null ? `${comfortIndex}/100` : '?/100'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-32 rounded-full h-3 transition-colors duration-500 ${
                      comfortIndex !== null && comfortIndex >= 80 ? 'bg-green-200 dark:bg-green-800' :
                      comfortIndex !== null && comfortIndex >= 60 ? 'bg-blue-200 dark:bg-blue-800' :
                      comfortIndex !== null && comfortIndex >= 40 ? 'bg-yellow-200 dark:bg-yellow-800' :
                      comfortIndex !== null ? 'bg-red-200 dark:bg-red-800' : 'bg-gray-200 dark:bg-gray-800'
                    }`}>
                      <div 
                        className={`h-3 rounded-full transition-all duration-700 ${
                          comfortIndex !== null && comfortIndex >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          comfortIndex !== null && comfortIndex >= 60 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          comfortIndex !== null && comfortIndex >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                          comfortIndex !== null ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'
                        }`}
                        style={{ width: comfortIndex !== null ? `${comfortIndex}%` : '0%' }}
                      />
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-500 ${
                      comfortIndex !== null && comfortIndex >= 80 ? 'text-green-600 dark:text-green-400' :
                      comfortIndex !== null && comfortIndex >= 60 ? 'text-blue-600 dark:text-blue-400' :
                      comfortIndex !== null && comfortIndex >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                      comfortIndex !== null ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {comfortIndex !== null ? (
                        comfortIndex >= 80 ? 'Отлично' :
                        comfortIndex >= 60 ? 'Комфортно' :
                        comfortIndex >= 40 ? 'Удовлетворительно' :
                        'Некомфортно'
                      ) : 'Неизвестно'}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 transition-colors duration-500 ${
                    comfortIndex !== null && comfortIndex >= 80 ? 'text-green-600 dark:text-green-400' :
                    comfortIndex !== null && comfortIndex >= 60 ? 'text-blue-600 dark:text-blue-400' :
                    comfortIndex !== null && comfortIndex >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                    comfortIndex !== null ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    Учитывает температуру, влажность, ветер и осадки
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-6 items-stretch">
              {weatherCards.map((data, index) => (
                <motion.div 
                  key={index} 
                  className="min-h-[300px] flex"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <WeatherCard {...data} />
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Button 
                variant="nasa"
                size="lg"
                onClick={() => setShowDetailedTable(!showDetailedTable)}
                className="mb-4 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {showDetailedTable ? (
                  <>
                    <ChevronUp className="w-5 h-5 mr-2" />
                    Скрыть детальную таблицу
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5 mr-2" />
                    Показать детальную таблицу
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                Данные обновляются на основе записей NASA MERRA-2, MODIS и GPM
              </p>
            </div>

            {/* Detailed Probabilities Table */}
            {showDetailedTable && (
              <motion.div 
                className="mt-8 bg-card rounded-lg shadow-card border border-border p-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold mb-4 text-center">
                  Детальная Таблица Расчитываемых Вероятностей
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Полный список всех метеорологических параметров и их пороговых значений на основе данных NASA POWER API
                </p>
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2">
                    <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Нажмите на заголовки колонок для сортировки данных
                    </p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="font-semibold cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('category')}
                        >
                          <div className="flex items-center">
                            Категория
                            {getSortIcon('category')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-semibold cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('parameter')}
                        >
                          <div className="flex items-center">
                            Параметр
                            {getSortIcon('parameter')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-center cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('probability')}
                        >
                          <div className="flex items-center justify-center">
                            Вероятность
                            {getSortIcon('probability')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-semibold cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('threshold')}
                        >
                          <div className="flex items-center">
                            Пороговое значение
                            {getSortIcon('threshold')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-semibold cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('description')}
                        >
                          <div className="flex items-center">
                            Описание
                            {getSortIcon('description')}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedProbabilities.map((item, index) => (
                        <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{item.category}</TableCell>
                          <TableCell>{item.parameter}</TableCell>
                          <TableCell className="text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium transition-all ${
                              item.probability >= 60 ? 'bg-red-100 text-red-800 shadow-sm' :
                              item.probability >= 40 ? 'bg-yellow-100 text-yellow-800 shadow-sm' :
                              item.probability >= 20 ? 'bg-blue-100 text-blue-800 shadow-sm' :
                              'bg-green-100 text-green-800 shadow-sm'
                            }`}>
                              {item.probability}%
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.threshold}</TableCell>
                          <TableCell className="text-muted-foreground">{item.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                  <h4 className="font-semibold mb-2">📊 Источники данных NASA:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li><strong>T2M, T2M_MAX, T2M_MIN:</strong> Температура на высоте 2м (°C)</li>
                    <li><strong>PRECTOTCORR:</strong> Скорректированные осадки (мм/день)</li>
                    <li><strong>WS2M:</strong> Скорость ветра на высоте 2м (м/с)</li>
                    <li><strong>RH2M:</strong> Относительная влажность на высоте 2м (%)</li>
                    <li><strong>Heat Index:</strong> Ощущаемая температура с учетом влажности</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    Период анализа: 1990-2023 годы | Статистика рассчитывается на основе перцентилей и абсолютных порогов
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Data Visualization */}
          <div className="bg-card rounded-lg shadow-card border border-border p-6 animate-slide-up">
            <Tabs defaultValue="charts" className="w-full">
              <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 mb-6">
                <TabsTrigger value="charts">Графики</TabsTrigger>
                <TabsTrigger value="map">Карта</TabsTrigger>
                <TabsTrigger value="download">Скачать Данные</TabsTrigger>
              </TabsList>
              
              <TabsContent value="charts" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Temperature Trend Chart */}
                  <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Thermometer className="w-5 h-5 mr-2 text-orange-500" />
                      Динамика Температуры
                    </h4>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg h-64 flex items-center justify-center border border-orange-200/50 dark:border-orange-800/50">
                      <div className="text-center">
                        <div className="text-sm text-orange-600 dark:text-orange-400 mb-2">Линейный график</div>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Исторические данные температуры с прогнозами и трендами
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Источник: NASA POWER API • Период: 1990-2023
                    </p>
                  </div>

                  {/* Probability Distribution Chart */}
                  <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Sun className="w-5 h-5 mr-2 text-blue-500" />
                      Распределение Вероятностей
                    </h4>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg h-64 flex items-center justify-center border border-blue-200/50 dark:border-blue-800/50">
                      <div className="text-center">
                        <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Столбчатая диаграмма</div>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Вероятности экстремальных погодных явлений по категориям
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Данные: Мультисорсный анализ • Обновление: реальное время
                    </p>
                  </div>

                  {/* Correlation Matrix */}
                  <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Wind className="w-5 h-5 mr-2 text-green-500" />
                      Корреляция Параметров
                    </h4>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg h-64 flex items-center justify-center border border-green-200/50 dark:border-green-800/50">
                      <div className="text-center">
                        <div className="text-sm text-green-600 dark:text-green-400 mb-2">Тепловая карта</div>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Взаимосвязи между температурой, влажностью, ветром и осадками
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Анализ: Статистические корреляции • Метод: Пирсон/Спирмен
                    </p>
                  </div>

                  {/* Risk Assessment Chart */}
                  <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Droplets className="w-5 h-5 mr-2 text-purple-500" />
                      Оценка Рисков
                    </h4>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg h-64 flex items-center justify-center border border-purple-200/50 dark:border-purple-800/50">
                      <div className="text-center">
                        <div className="text-sm text-purple-600 dark:text-purple-400 mb-2">Радарная диаграмма</div>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Комплексная оценка погодных рисков по всем параметрам
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Модель: NASA Earth Science • Валидация: Исторические данные
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📊 Типы визуализации данных:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-800 dark:text-blue-200"><strong>Временные ряды:</strong> Динамика изменений метеопараметров</p>
                      <p className="text-blue-800 dark:text-blue-200"><strong>Распределения:</strong> Статистический анализ вероятностей</p>
                    </div>
                    <div>
                      <p className="text-blue-800 dark:text-blue-200"><strong>Корреляции:</strong> Взаимосвязи между факторами</p>
                      <p className="text-blue-800 dark:text-blue-200"><strong>Риск-анализ:</strong> Комплексная оценка угроз</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="map" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Интерактивная Тепловая Карта</h3>
                <div className="bg-muted/30 rounded-lg h-96 flex items-center justify-center border border-border">
                  <p className="text-muted-foreground">Здесь будет интерактивная карта с тепловым наложением</p>
                </div>
              </TabsContent>
              
              <TabsContent value="download" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Экспорт Данных о Погоде</h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Скачайте исторические данные о вероятности погоды для выбранной локации и диапазона дат.
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Скачать как CSV
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Скачать как JSON
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Данные предоставлены NASA EarthData (MERRA-2, MODIS, GPM)
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
