import { useState } from "react";
import * as React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import WeatherCard from "@/components/WeatherCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sun, Snowflake, Wind, Droplets, Frown, Search, MapPin, Calendar as CalendarIcon, Download, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown, Thermometer, Eye, Zap } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [showDetailedTable, setShowDetailedTable] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: 'category' | 'parameter' | 'probability' | 'threshold' | 'description';
    direction: 'asc' | 'desc';
  } | null>(null);

  // Ключевые метрики погоды (из API statistics)
  const weatherMetrics = {
    averageTemp: unit === "C" ? 23.5 : 74.3,
    feelsLikeTemp: unit === "C" ? 26.8 : 80.2,
    airQuality: 42, // PM2.5 в μg/m³
    airQualityStatus: "Умеренно" as const
  };

  // Функция для получения статуса качества воздуха
  const getAirQualityStatus = (value: number) => {
    if (value <= 12) return { status: 'Хорошо', color: 'green' };
    if (value <= 35) return { status: 'Умеренно', color: 'yellow' };
    if (value <= 55) return { status: 'Плохо', color: 'orange' };
    return { status: 'Опасно', color: 'red' };
  };

  const weatherData = [
    {
      title: "Ощущаемая температура",
      probability: 34,
      description: `34% вероятность ощущения ${unit === "C" ? ">40°C" : ">104°F"} (Heat Index)`,
      icon: Sun,
      variant: "uncomfortable" as const,
    },
    {
      title: "Очень Жарко", 
      probability: 42,
      description: `42% вероятность жары ${unit === "C" ? ">30°C" : ">86°F"} (>90-й перцентиль)`,
      icon: Sun,
      variant: "hot" as const,
    },
    {
      title: "Очень Холодно",
      probability: 15,
      description: `15% вероятность холода ${unit === "C" ? "<0°C" : "<32°F"} (<10-й перцентиль)`,
      icon: Snowflake,
      variant: "cold" as const,
    },
    {
      title: "Очень Ветрено",
      probability: 30,
      description: "30% вероятность ветра >20м/с",
      icon: Wind,
      variant: "windy" as const,
    },
    {
      title: "Очень Влажно",
      probability: 58,
      description: "58% вероятность осадков >100мм",
      icon: Droplets,
      variant: "humid" as const,
    },
  ];

  // Детальные данные для таблицы вероятностей (на основе NASA данных)
  const detailedProbabilities = [
    // Температурные условия
    { 
      category: "🌡️ Температура", 
      parameter: "Очень жарко", 
      probability: 42, 
      threshold: ">90-й перцентиль или >30°C",
      description: "Экстремально высокие температуры"
    },
    { 
      category: "🌡️ Температура", 
      parameter: "Жарко", 
      probability: 65, 
      threshold: ">75-й перцентиль или >25°C",
      description: "Высокие температуры"
    },
    { 
      category: "🌡️ Температура", 
      parameter: "Комфортная температура", 
      probability: 38, 
      threshold: "15-25°C",
      description: "Оптимальный температурный диапазон"
    },
    { 
      category: "🌡️ Температура", 
      parameter: "Холодно", 
      probability: 22, 
      threshold: "<25-й перцентиль или <10°C",
      description: "Низкие температуры"
    },
    { 
      category: "🌡️ Температура", 
      parameter: "Очень холодно", 
      probability: 15, 
      threshold: "<10-й перцентиль или <-10°C",
      description: "Экстремально низкие температуры"
    },
    // Осадки
    { 
      category: "💧 Осадки", 
      parameter: "Очень влажно", 
      probability: 58, 
      threshold: ">100мм",
      description: "Сильные ливни и грозы"
    },
    { 
      category: "💧 Осадки", 
      parameter: "Сильный дождь", 
      probability: 35, 
      threshold: ">50мм",
      description: "Интенсивные осадки"
    },
    { 
      category: "💧 Осадки", 
      parameter: "Умеренный дождь", 
      probability: 28, 
      threshold: "5-50мм",
      description: "Обычные дождевые осадки"
    },
    { 
      category: "💧 Осадки", 
      parameter: "Легкий дождь", 
      probability: 45, 
      threshold: "0.1-5мм",
      description: "Моросящий дождь"
    },
    { 
      category: "💧 Осадки", 
      parameter: "Сухо", 
      probability: 42, 
      threshold: "<0.1мм",
      description: "Отсутствие осадков"
    },
    // Ветер
    { 
      category: "💨 Ветер", 
      parameter: "Очень ветрено", 
      probability: 30, 
      threshold: ">20 м/с",
      description: "Штормовой ветер"
    },
    { 
      category: "💨 Ветер", 
      parameter: "Сильный ветер", 
      probability: 25, 
      threshold: "10-20 м/с",
      description: "Сильные порывы ветра"
    },
    { 
      category: "💨 Ветер", 
      parameter: "Умеренный ветер", 
      probability: 35, 
      threshold: "5-10 м/с",
      description: "Обычная скорость ветра"
    },
    { 
      category: "💨 Ветер", 
      parameter: "Штиль", 
      probability: 18, 
      threshold: "<2 м/с",
      description: "Слабый или отсутствующий ветер"
    },
    // Индекс комфорта
    { 
      category: "🏠 Комфорт", 
      parameter: "Очень некомфортно", 
      probability: 23, 
      threshold: "Heat Index >40°C",
      description: "Опасный уровень жары с учетом влажности"
    },
    { 
      category: "🏠 Комфорт", 
      parameter: "Некомфортно жарко", 
      probability: 38, 
      threshold: "T>25°C + влажность >70%",
      description: "Душная погода"
    },
    { 
      category: "🏠 Комфорт", 
      parameter: "Комфортно", 
      probability: 32, 
      threshold: "T: 18-24°C, влажность <70%",
      description: "Оптимальные условия для человека"
    },
  ];

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
                    placeholder="Введите локацию" 
                    className="pl-10"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Широта</label>
                <Input 
                  placeholder="Например: 55.7558" 
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
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
                <Button variant="nasa" size="default" className="w-full px-2 text-sm">
                  Анализировать
                </Button>
              </div>
            </div>
            
            {/* Second row */}
            <div className="grid gap-4 items-end" style={{gridTemplateColumns: "2fr 1fr 1fr 0.8fr"}}>
              <div className="flex gap-2 items-end w-full">
                <Button variant="outline" className="flex-1 flex items-center justify-center text-sm px-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>Моя локация</span>
                </Button>
                <Button variant="outline" className="flex-1 flex items-center justify-center text-sm px-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>На карте</span>
                </Button>
                <Button 
                  variant={unit === "C" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setUnit("C")}
                  className="w-10 h-10 px-1 text-xs flex-shrink-0"
                >
                  °C
                </Button>
                <Button 
                  variant={unit === "F" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setUnit("F")}
                  className="w-10 h-10 px-1 text-xs flex-shrink-0"
                >
                  °F
                </Button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Долгота</label>
                <Input 
                  placeholder="Например: 37.6173" 
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
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
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="dateRange" 
                  className="rounded border-border"
                />
                <label htmlFor="dateRange" className="text-sm text-muted-foreground">
                  Диапазон дат
                </label>
              </div>
            </div>
          </div>

          {/* Key Weather Metrics - Apple Weather Style */}
          <motion.div 
            className="grid grid-cols-3 gap-4 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
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
              68 >= 80 ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800' :
              68 >= 60 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800' :
              68 >= 40 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-200 dark:border-yellow-800' :
              'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full transition-all duration-500 ${
                    68 >= 80 ? 'bg-green-500' :
                    68 >= 60 ? 'bg-blue-500' :
                    68 >= 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}>
                    <Sun className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold transition-colors duration-500 ${
                      68 >= 80 ? 'text-green-900 dark:text-green-100' :
                      68 >= 60 ? 'text-blue-900 dark:text-blue-100' :
                      68 >= 40 ? 'text-yellow-900 dark:text-yellow-100' :
                      'text-red-900 dark:text-red-100'
                    }`}>Индекс Комфорта</h3>
                    <p className={`transition-colors duration-500 ${
                      68 >= 80 ? 'text-green-700 dark:text-green-300' :
                      68 >= 60 ? 'text-blue-700 dark:text-blue-300' :
                      68 >= 40 ? 'text-yellow-700 dark:text-yellow-300' :
                      'text-red-700 dark:text-red-300'
                    }`}>Общая оценка погодных условий</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold mb-1 transition-colors duration-500 ${
                    68 >= 80 ? 'text-green-600 dark:text-green-400' :
                    68 >= 60 ? 'text-blue-600 dark:text-blue-400' :
                    68 >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    68/100
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-32 rounded-full h-3 transition-colors duration-500 ${
                      68 >= 80 ? 'bg-green-200 dark:bg-green-800' :
                      68 >= 60 ? 'bg-blue-200 dark:bg-blue-800' :
                      68 >= 40 ? 'bg-yellow-200 dark:bg-yellow-800' :
                      'bg-red-200 dark:bg-red-800'
                    }`}>
                      <div 
                        className={`h-3 rounded-full transition-all duration-700 ${
                          68 >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          68 >= 60 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          68 >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: '68%' }}
                      />
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-500 ${
                      68 >= 80 ? 'text-green-600 dark:text-green-400' :
                      68 >= 60 ? 'text-blue-600 dark:text-blue-400' :
                      68 >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {68 >= 80 ? 'Отлично' :
                       68 >= 60 ? 'Комфортно' :
                       68 >= 40 ? 'Удовлетворительно' :
                       'Некомфортно'}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 transition-colors duration-500 ${
                    68 >= 80 ? 'text-green-600 dark:text-green-400' :
                    68 >= 60 ? 'text-blue-600 dark:text-blue-400' :
                    68 >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    Учитывает температуру, влажность, ветер и осадки
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-6 items-stretch">
              {weatherData.map((data, index) => (
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
