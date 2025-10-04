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
import { Sun, Snowflake, Wind, Droplets, Frown, Search, MapPin, Calendar as CalendarIcon, Download, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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

  const weatherData = [
    {
      title: "Очень Жарко",
      probability: 42,
      description: `42% вероятность жары выше ${unit === "C" ? "35°C" : "95°F"}`,
      icon: Sun,
      variant: "hot" as const,
    },
    {
      title: "Очень Холодно",
      probability: 15,
      description: `15% вероятность холода ниже ${unit === "C" ? "0°C" : "32°F"}`,
      icon: Snowflake,
      variant: "cold" as const,
    },
    {
      title: "Очень Ветрено",
      probability: 30,
      description: "30% вероятность ветра >10м/с",
      icon: Wind,
      variant: "windy" as const,
    },
    {
      title: "Очень Влажно",
      probability: 58,
      description: "58% вероятность влажности >80%",
      icon: Droplets,
      variant: "humid" as const,
    },
    {
      title: "Дискомфортно",
      probability: 23,
      description: "23% вероятность превышения индекса дискомфорта",
      icon: Frown,
      variant: "uncomfortable" as const,
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

          {/* Results Overview */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Обзор Вероятности Погоды
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Анализ экстремальных погодных условий на основе исторических данных NASA
              </p>
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
            <Tabs defaultValue="trends" className="w-full">
              <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 mb-6">
                <TabsTrigger value="trends">Тренды</TabsTrigger>
                <TabsTrigger value="map">Карта</TabsTrigger>
                <TabsTrigger value="download">Скачать Данные</TabsTrigger>
              </TabsList>
              
              <TabsContent value="trends" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Исторический Тренд Температуры</h3>
                <div className="bg-muted/30 rounded-lg h-80 flex items-center justify-center border border-border">
                  <p className="text-muted-foreground">Здесь будет интерактивная визуализация графика</p>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  15 июля исторически имеет 60% вероятность высокой влажности в этой области на основе 10-летних записей.
                </p>
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
