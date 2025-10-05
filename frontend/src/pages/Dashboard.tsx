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

  // Function to get geolocation
  const handleGetMyLocation = () => {
    if ("geolocation" in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setLocation(""); // Clear location name when getting coordinates
          setIsLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLoading(false);
        }
      );
    }
  };

  // Geocoding function (convert location name to coordinates)
  const geocodeLocation = async (locationName: string): Promise<{lat: number, lon: number} | null> => {
    try {
      // Use Nominatim OpenStreetMap API (free)
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

  // Weather analysis function
  const handleAnalyze = async () => {
    let finalLat: number | null = null;
    let finalLon: number | null = null;

    // Check: either coordinates or location name
    if (latitude && longitude) {
      // Use coordinates directly
      finalLat = parseFloat(latitude);
      finalLon = parseFloat(longitude);
    } else if (location.trim()) {
      // Convert location name to coordinates
      setIsLoading(true);
      const coords = await geocodeLocation(location.trim());
      setIsLoading(false);
      
      if (!coords) {
        alert(`Could not find coordinates for "${location}". Please try entering coordinates manually.`);
        return;
      }
      
      finalLat = coords.lat;
      finalLon = coords.lon;
      
      // Update coordinate fields for display
      setLatitude(coords.lat.toFixed(6));
      setLongitude(coords.lon.toFixed(6));
    } else {
      alert("Please specify a location: enter a city name or coordinates (latitude and longitude), or select on the map");
      return;
    }

    if (!date) {
      alert("Please select a date");
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
      console.log("Probabilities:", data?.probabilities);
      console.log("Statistics:", data?.statistics);
      setWeatherData(data);
      setShowMetrics(true);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      alert("Error fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  // Ключевые метрики погоды (из API statistics или дефолтные значения)
  const weatherMetrics = weatherData?.statistics ? {
    averageTemp: weatherData.statistics.temperature?.mean || 0,
    feelsLikeTemp: weatherData.statistics.apparent_temperature?.mean || weatherData.statistics.temperature?.mean || 0,
    airQuality: weatherData.statistics.air_quality?.aod_mean 
      ? Math.round(weatherData.statistics.air_quality.aod_mean * 1000) / 10  // Convert AOD to readable format
      : 0,
    airQualityStatus: weatherData.statistics.air_quality?.level || "No data" as const
  } : {
    averageTemp: 0,
    feelsLikeTemp: 0,
    airQuality: 0,
    airQualityStatus: "No data" as const
  };

  // Function to get air quality status by AOD
  const getAirQualityStatus = (value: number) => {
    // AOD (Aerosol Optical Depth) interpretation
    if (value <= 0.1) return { status: 'Good', color: 'green' };
    if (value <= 0.3) return { status: 'Moderate', color: 'yellow' };
    if (value <= 0.5) return { status: 'Poor', color: 'orange' };
    return { status: 'Hazardous', color: 'red' };
  };

  // Вычисление индекса комфорта (0-100) на основе вероятностей
  const calculateComfortIndex = () => {
    if (!weatherData?.probabilities) return null;
    
    const probs = weatherData.probabilities;
    
    // Начинаем с базового значения и считаем взвешенную сумму
    // Вероятности уже в диапазоне 0-1, поэтому умножаем на 100 для процентов
    let comfortScore = 50; // Базовое значение
    
    // Комфортные условия повышают индекс
    comfortScore += (probs.comfortable || 0) * 50;           // +50 за комфортную температуру
    comfortScore += (probs.comfortable_comfort || 0) * 30;   // +30 за общий комфорт
    comfortScore += (probs.clear || 0) * 10;                 // +10 за ясную погоду
    comfortScore += (probs.calm || 0) * 10;                  // +10 за штиль
    
    // Некомфортные условия снижают индекс
    comfortScore -= (probs.very_hot || 0) * 40;              // -40 за очень жарко
    comfortScore -= (probs.very_cold || 0) * 40;             // -40 за очень холодно
    comfortScore -= (probs.very_uncomfortable || 0) * 50;    // -50 за очень некомфортно
    comfortScore -= (probs.very_wet || 0) * 30;              // -30 за сильные осадки
    comfortScore -= (probs.very_windy || 0) * 25;            // -25 за сильный ветер
    comfortScore -= (probs.hot || 0) * 20;                   // -20 за жарко
    comfortScore -= (probs.cold || 0) * 20;                  // -20 за холодно
    comfortScore -= (probs.heavy_rain || 0) * 15;            // -15 за сильный дождь
    comfortScore -= (probs.uncomfortable || 0) * 15;         // -15 за некомфортно
    
    // Ограничиваем диапазон 0-100
    return Math.max(0, Math.min(100, Math.round(comfortScore)));
  };

  const comfortIndex = calculateComfortIndex();

  // 5 key weather cards with API data
  const weatherCards = weatherData?.probabilities ? [
    {
      title: "Comfortable Temperature",
      probability: Math.round((weatherData.probabilities.comfortable || 0) * 100),
      description: `Probability of comfortable temperature (15-25°C)`,
      icon: Sun,
      variant: "uncomfortable" as const,
    },
    {
      title: "Hot", 
      probability: Math.round((weatherData.probabilities.hot || 0) * 100),
      description: `Probability of hot temperature (25-30°C)`,
      icon: Sun,
      variant: "hot" as const,
    },
    {
      title: "Cold",
      probability: Math.round((weatherData.probabilities.cold || 0) * 100),
      description: `Probability of cold temperature (0-10°C)`,
      icon: Snowflake,
      variant: "cold" as const,
    },
    {
      title: "Clear Sky",
      probability: Math.round((weatherData.probabilities.clear || 0) * 100),
      description: "Probability of clear sky (<20% clouds)",
      icon: Wind,
      variant: "windy" as const,
    },
    {
      title: "Dry Weather",
      probability: Math.round((weatherData.probabilities.dry || 0) * 100),
      description: "Probability of no precipitation",
      icon: Droplets,
      variant: "humid" as const,
    },
  ] : [
    {
      title: "Comfortable Temperature",
      probability: 0,
      description: `Probability of comfortable temperature`,
      icon: Sun,
      variant: "uncomfortable" as const,
    },
    {
      title: "Hot", 
      probability: 0,
      description: `Probability of hot temperature`,
      icon: Sun,
      variant: "hot" as const,
    },
    {
      title: "Cold",
      probability: 0,
      description: `Probability of cold temperature ${unit === "C" ? "<0°C" : "<32°F"} (<10th percentile)`,
      icon: Snowflake,
      variant: "cold" as const,
    },
    {
      title: "Very Windy",
      probability: 0,
      description: "Probability of wind >20m/s",
      icon: Wind,
      variant: "windy" as const,
    },
    {
      title: "Very Wet",
      probability: 0,
      description: "Probability of precipitation >100mm",
      icon: Droplets,
      variant: "humid" as const,
    },
  ];

  // Детальные данные для таблицы вероятностей (на основе NASA данных)
  const detailedProbabilities = weatherData?.probabilities ? [
    // === TEMPERATURE ===
    { 
      category: "🌡️ Temperature", 
      parameter: "Hot", 
      probability: Math.round((weatherData.probabilities.hot || 0) * 100),
      threshold: "25-30°C",
      description: "Hot temperature"
    },
    { 
      category: "🌡️ Temperature", 
      parameter: "Warm", 
      probability: Math.round((weatherData.probabilities.warm || 0) * 100),
      threshold: "20-25°C",
      description: "Warm and pleasant"
    },
    { 
      category: "🌡️ Temperature", 
      parameter: "Comfortable Temperature", 
      probability: Math.round((weatherData.probabilities.comfortable || 0) * 100),
      threshold: "15-25°C",
      description: "Optimal temperature range"
    },
    { 
      category: "🌡️ Temperature", 
      parameter: "Cool", 
      probability: Math.round((weatherData.probabilities.cool || 0) * 100),
      threshold: "10-15°C",
      description: "Cool temperature"
    },
    { 
      category: "🌡️ Temperature", 
      parameter: "Cold", 
      probability: Math.round((weatherData.probabilities.cold || 0) * 100),
      threshold: "0-10°C",
      description: "Cold temperature"
    },
    
    // === PRECIPITATION ===
    { 
      category: "💧 Precipitation", 
      parameter: "Heavy Rain", 
      probability: Math.round((weatherData.probabilities.heavy_rain || 0) * 100),
      threshold: ">50mm",
      description: "Intense precipitation"
    },
    { 
      category: "💧 Precipitation", 
      parameter: "Moderate Rain", 
      probability: Math.round((weatherData.probabilities.moderate_rain || 0) * 100),
      threshold: "10-50mm",
      description: "Moderate rainfall"
    },
    { 
      category: "💧 Precipitation", 
      parameter: "Light Rain", 
      probability: Math.round((weatherData.probabilities.light_rain || 0) * 100),
      threshold: "0.1-10mm",
      description: "Light drizzle"
    },
    { 
      category: "💧 Precipitation", 
      parameter: "Dry", 
      probability: Math.round((weatherData.probabilities.dry || 0) * 100),
      threshold: "<0.1mm",
      description: "No precipitation"
    },
    
    // === WIND ===
    { 
      category: "💨 Wind", 
      parameter: "Strong Wind", 
      probability: Math.round((weatherData.probabilities.strong_wind || 0) * 100),
      threshold: "10-20 m/s",
      description: "Strong breeze"
    },
    { 
      category: "💨 Wind", 
      parameter: "Moderate Wind", 
      probability: Math.round((weatherData.probabilities.moderate_wind || 0) * 100),
      threshold: "5-10 m/s",
      description: "Moderate breeze"
    },
    { 
      category: "💨 Wind", 
      parameter: "Light Breeze", 
      probability: Math.round((weatherData.probabilities.light_breeze || 0) * 100),
      threshold: "2-5 m/s",
      description: "Gentle breeze"
    },
    { 
      category: "💨 Wind", 
      parameter: "Calm", 
      probability: Math.round((weatherData.probabilities.calm || 0) * 100),
      threshold: "<2 m/s",
      description: "Light or no wind"
    },
    
    // === AIR QUALITY ===
    { 
      category: "�️ Air Quality", 
      parameter: "Good Air", 
      probability: Math.round((weatherData.probabilities.good_air || 0) * 100),
      threshold: "AQI <50",
      description: "Clean air quality"
    },
    
    // === UV INDEX ===
    { 
      category: "☀️ UV Index", 
      parameter: "Extreme", 
      probability: Math.round((weatherData.probabilities.extreme_uv || 0) * 100),
      threshold: "UV >11",
      description: "Dangerous UV radiation level"
    },
    { 
      category: "☀️ UV Index", 
      parameter: "Very High", 
      probability: Math.round((weatherData.probabilities.very_high_uv || 0) * 100),
      threshold: "UV 8-11",
      description: "High risk of sunburn"
    },
    { 
      category: "☀️ UV Index", 
      parameter: "High", 
      probability: Math.round((weatherData.probabilities.high_uv || 0) * 100),
      threshold: "UV 6-7",
      description: "Moderate sunburn risk"
    },
    { 
      category: "☀️ UV Index", 
      parameter: "Moderate", 
      probability: Math.round((weatherData.probabilities.moderate_uv || 0) * 100),
      threshold: "UV 3-5",
      description: "Moderate UV level"
    },
    { 
      category: "☀️ UV Index", 
      parameter: "Low", 
      probability: Math.round((weatherData.probabilities.low_uv || 0) * 100),
      threshold: "UV <3",
      description: "Safe UV level"
    },
    
    // === CLOUDINESS ===
    { 
      category: "☁️ Cloudiness", 
      parameter: "Clear", 
      probability: Math.round((weatherData.probabilities.clear || 0) * 100),
      threshold: "<20% coverage",
      description: "Clear sky"
    },
    { 
      category: "☁️ Cloudiness", 
      parameter: "Partly Cloudy", 
      probability: Math.round((weatherData.probabilities.partly_cloudy || 0) * 100),
      threshold: "20-50% coverage",
      description: "Partially cloudy"
    },
    { 
      category: "☁️ Cloudiness", 
      parameter: "Mostly Cloudy", 
      probability: Math.round((weatherData.probabilities.mostly_cloudy || 0) * 100),
      threshold: "50-80% coverage",
      description: "Predominantly cloudy"
    },
    { 
      category: "☁️ Cloudiness", 
      parameter: "Overcast", 
      probability: Math.round((weatherData.probabilities.overcast || 0) * 100),
      threshold: ">80% coverage",
      description: "Complete cloud coverage"
    },
    
    // === PRESSURE ===
    { 
      category: "🌀 Pressure", 
      parameter: "Low", 
      probability: Math.round((weatherData.probabilities.low_pressure || 0) * 100),
      threshold: "<1000 hPa",
      description: "Cyclone, possible precipitation"
    },
    { 
      category: "🌀 Pressure", 
      parameter: "Normal", 
      probability: Math.round((weatherData.probabilities.normal_pressure || 0) * 100),
      threshold: "1000-1020 hPa",
      description: "Normal atmospheric pressure"
    },
    { 
      category: "🌀 Pressure", 
      parameter: "High", 
      probability: Math.round((weatherData.probabilities.high_pressure || 0) * 100),
      threshold: ">1020 hPa",
      description: "Anticyclone, clear weather"
    },
    
    // === SNOW ===
    { 
      category: "❄️ Snow", 
      parameter: "Heavy Snow", 
      probability: Math.round((weatherData.probabilities.heavy_snow || 0) * 100),
      threshold: ">10cm depth",
      description: "Heavy snowfall"
    },
    { 
      category: "❄️ Snow", 
      parameter: "Moderate Snow", 
      probability: Math.round((weatherData.probabilities.moderate_snow || 0) * 100),
      threshold: "2-10cm depth",
      description: "Moderate snowfall"
    },
    { 
      category: "❄️ Snow", 
      parameter: "Light Snow", 
      probability: Math.round((weatherData.probabilities.light_snow || 0) * 100),
      threshold: "<2cm depth",
      description: "Light snow"
    },
    { 
      category: "❄️ Snow", 
      parameter: "No Snow", 
      probability: Math.round((weatherData.probabilities.no_snow || 0) * 100),
      threshold: "0cm",
      description: "No snow"
    },
    
    // === VISIBILITY ===
    { 
      category: "👁️ Visibility", 
      parameter: "Excellent", 
      probability: Math.round((weatherData.probabilities.excellent_visibility || 0) * 100),
      threshold: ">10km",
      description: "Excellent visibility"
    },
    { 
      category: "👁️ Visibility", 
      parameter: "Very Poor", 
      probability: Math.round((weatherData.probabilities.very_poor_visibility || 0) * 100),
      threshold: "<1km",
      description: "Fog or haze"
    },
    
    // === DEW POINT ===
    { 
      category: "💦 Dew Point", 
      parameter: "Very Dry", 
      probability: Math.round((weatherData.probabilities.dew_very_dry || 0) * 100),
      threshold: "<0°C",
      description: "Very dry air"
    },
    
    // === SOLAR RADIATION ===
    { 
      category: "� Solar Radiation", 
      parameter: "Very High", 
      probability: Math.round((weatherData.probabilities.very_high_solar || 0) * 100),
      threshold: ">800 W/m²",
      description: "Intense solar radiation"
    },
    { 
      category: "🔆 Solar Radiation", 
      parameter: "Moderate", 
      probability: Math.round((weatherData.probabilities.moderate_solar || 0) * 100),
      threshold: "400-800 W/m²",
      description: "Moderate solar radiation"
    },
    { 
      category: "🔆 Solar Radiation", 
      parameter: "Low", 
      probability: Math.round((weatherData.probabilities.low_solar || 0) * 100),
      threshold: "<200 W/m²",
      description: "Weak solar radiation"
    },
    
    // === THUNDERSTORM RISK ===
    { 
      category: "⛈️ Thunderstorm Risk", 
      parameter: "No Risk", 
      probability: Math.round((weatherData.probabilities.no_storm_risk || 0) * 100),
      threshold: "0%",
      description: "No thunderstorm risk"
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
            <h1 className="text-4xl font-bold mb-2">Weather Analysis Dashboard</h1>
            <p className="text-muted-foreground">
              Analyze extreme weather probabilities using NASA Earth observation data
            </p>
          </div>

          {/* Control Panel */}
          <div className="bg-card p-6 rounded-lg shadow-card border border-border mb-8 animate-slide-up">
            {/* First row */}
            <div className="grid gap-4 items-end mb-4" style={{gridTemplateColumns: "2fr 1fr 1fr 0.8fr"}}>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Enter city name" 
                    className="pl-10"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      // Clear coordinates when entering a name
                      if (e.target.value.trim()) {
                        setLatitude("");
                        setLongitude("");
                      }
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Latitude</label>
                <Input 
                  placeholder="E.g.: 55.7558" 
                  value={latitude}
                  onChange={(e) => {
                    setLatitude(e.target.value);
                    // Clear name when entering coordinates
                    if (e.target.value.trim()) {
                      setLocation("");
                    }
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
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
                      {date ? format(date, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="pointer-events-auto"
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
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
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
                  <span className="whitespace-nowrap">My Location</span>
                </Button>
                
                <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 flex items-center justify-center text-sm px-1 flex-shrink-0">
                      <MapIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="whitespace-nowrap">On Map</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] max-h-[90vh] w-full p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                      <DialogTitle className="text-lg sm:text-2xl font-bold">Select location on map</DialogTitle>
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
                          {latitude && longitude ? 'Close' : 'Select Tashkent'}
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
                <label className="block text-sm font-medium mb-2">Longitude</label>
                <Input 
                  placeholder="Example: 37.6173" 
                  value={longitude}
                  onChange={(e) => {
                    setLongitude(e.target.value);
                    // If entering coordinates, clear location name
                    if (e.target.value.trim()) {
                      setLocation("");
                    }
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date to</label>
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
                      {dateEnd ? format(dateEnd, "PPP", { locale: ru }) : <span>Not selected (one day)</span>}
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
                      TEMPERATURE
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
                  Average for period
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
                    FEELS LIKE
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
                  With humidity
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
                    AIR QUALITY
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
                      {weatherMetrics.airQuality <= 12 ? 'Good' :
                       weatherMetrics.airQuality <= 35 ? 'Moderate' :
                       weatherMetrics.airQuality <= 55 ? 'Poor' :
                       'Hazardous'}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  PM2.5 concentration
                </div>
              </div>
            </motion.div>
          </motion.div>
          )}

          {/* Results Overview */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Weather Probability Overview
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Analysis of weather conditions: key metrics, comfort index and probabilities of extreme events based on NASA data
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
                    }`}>Comfort Index</h3>
                    <p className={`transition-colors duration-500 ${
                      comfortIndex !== null && comfortIndex >= 80 ? 'text-green-700 dark:text-green-300' :
                      comfortIndex !== null && comfortIndex >= 60 ? 'text-blue-700 dark:text-blue-300' :
                      comfortIndex !== null && comfortIndex >= 40 ? 'text-yellow-700 dark:text-yellow-300' :
                      comfortIndex !== null ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'
                    }`}>Overall weather conditions rating</p>
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
                        comfortIndex >= 80 ? 'Excellent' :
                        comfortIndex >= 60 ? 'Comfortable' :
                        comfortIndex >= 40 ? 'Fair' :
                        'Uncomfortable'
                      ) : 'Unknown'}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 transition-colors duration-500 ${
                    comfortIndex !== null && comfortIndex >= 80 ? 'text-green-600 dark:text-green-400' :
                    comfortIndex !== null && comfortIndex >= 60 ? 'text-blue-600 dark:text-blue-400' :
                    comfortIndex !== null && comfortIndex >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                    comfortIndex !== null ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    Considers temperature, humidity, wind and precipitation
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
                    Hide detailed table
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5 mr-2" />
                    Show detailed table
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                Data is updated based on NASA MERRA-2, MODIS and GPM records
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
                  Detailed Table of Calculated Probabilities
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Complete list of all meteorological parameters and their threshold values based on NASA POWER API data
                </p>
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2">
                    <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Click on column headers to sort data
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
                            Category
                            {getSortIcon('category')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-semibold cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('parameter')}
                        >
                          <div className="flex items-center">
                            Parameter
                            {getSortIcon('parameter')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-center cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('probability')}
                        >
                          <div className="flex items-center justify-center">
                            Probability
                            {getSortIcon('probability')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-semibold cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('threshold')}
                        >
                          <div className="flex items-center">
                            Threshold value
                            {getSortIcon('threshold')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-semibold cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('description')}
                        >
                          <div className="flex items-center">
                            Description
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
                  <h4 className="font-semibold mb-2">📊 Data Sources NASA:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li><strong>T2M, T2M_MAX, T2M_MIN:</strong> Temperature at 2m height (°C)</li>
                    <li><strong>PRECTOTCORR:</strong> Corrected precipitation (mm/day)</li>
                    <li><strong>WS2M:</strong> Wind Speed at 2m height (m/s)</li>
                    <li><strong>RH2M:</strong> Relative humidity at 2m height (%)</li>
                    <li><strong>Heat Index:</strong> Feels-like temperature with humidity</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    Analysis period: 1990-2023 | Statistics calculated based on percentiles and absolute thresholds
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Data Visualization */}
          <div className="bg-card rounded-lg shadow-card border border-border p-6 animate-slide-up">
            <Tabs defaultValue="charts" className="w-full">
              <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 mb-6">
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="download">Download Data</TabsTrigger>
              </TabsList>
              
              <TabsContent value="charts" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Temperature Trend Chart */}
                  <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Thermometer className="w-5 h-5 mr-2 text-orange-500" />
                      Temperature Dynamics
                    </h4>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg h-64 flex items-center justify-center border border-orange-200/50 dark:border-orange-800/50">
                      <div className="text-center">
                        <div className="text-sm text-orange-600 dark:text-orange-400 mb-2">Line Chart</div>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Historical temperature data with forecasts and trends
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Source: NASA POWER API • Period: 1990-2023
                    </p>
                  </div>

                  {/* Probability Distribution Chart */}
                  <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Sun className="w-5 h-5 mr-2 text-blue-500" />
                      Probability Distribution
                    </h4>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg h-64 flex items-center justify-center border border-blue-200/50 dark:border-blue-800/50">
                      <div className="text-center">
                        <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Bar Chart</div>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Probabilities of extreme weather events by category
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Data: Multi-source analysis • Update: real time
                    </p>
                  </div>

                  {/* Correlation Matrix */}
                  <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Wind className="w-5 h-5 mr-2 text-green-500" />
                      Parameter Correlation
                    </h4>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg h-64 flex items-center justify-center border border-green-200/50 dark:border-green-800/50">
                      <div className="text-center">
                        <div className="text-sm text-green-600 dark:text-green-400 mb-2">Heat map</div>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Relationships between temperature, humidity, wind and precipitation
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Analysis: Statistical correlations • Method: Pearson/Spearman
                    </p>
                  </div>

                  {/* Risk Assessment Chart */}
                  <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Droplets className="w-5 h-5 mr-2 text-purple-500" />
                      Risk Assessment
                    </h4>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg h-64 flex items-center justify-center border border-purple-200/50 dark:border-purple-800/50">
                      <div className="text-center">
                        <div className="text-sm text-purple-600 dark:text-purple-400 mb-2">Radar chart</div>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Comprehensive assessment of weather risks across all parameters
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Model: NASA Earth Science • Validation: Historical data
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📊 Data Visualization Types:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-800 dark:text-blue-200"><strong>Time Series:</strong> Dynamics of meteorological parameters</p>
                      <p className="text-blue-800 dark:text-blue-200"><strong>Distributions:</strong> Statistical probability analysis</p>
                    </div>
                    <div>
                      <p className="text-blue-800 dark:text-blue-200"><strong>Correlations:</strong> Relationships between factors</p>
                      <p className="text-blue-800 dark:text-blue-200"><strong>Risk Analysis:</strong> Comprehensive threat assessment</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="download" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Export Weather Data</h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Download historical weather probability data for the selected location and date range.
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
