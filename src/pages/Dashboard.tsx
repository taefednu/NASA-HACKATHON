import { useState } from "react";
import Navbar from "@/components/Navbar";
import WeatherCard from "@/components/WeatherCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Snowflake, Wind, Droplets, Frown, Search, MapPin, Calendar as CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [unit, setUnit] = useState<"C" | "F">("C");

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
            <div className="grid md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Локация</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Введите город" 
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
                <label className="block text-sm font-medium mb-2">Долгота</label>
                <Input 
                  placeholder="Например: 37.6173" 
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
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
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <Button variant="outline" size="sm">
                <MapPin className="w-4 h-4 mr-2" />
                Моя Локация
              </Button>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>Единицы:</span>
                <Button 
                  variant={unit === "C" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setUnit("C")}
                  className="h-8 px-3"
                >
                  °C
                </Button>
                <Button 
                  variant={unit === "F" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setUnit("F")}
                  className="h-8 px-3"
                >
                  °F
                </Button>
              </div>
              <Button variant="nasa" size="lg">
                Анализировать
              </Button>
            </div>
          </div>

          {/* Results Overview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Обзор Вероятности Погоды</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {weatherData.map((data, index) => (
                <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                  <WeatherCard {...data} />
                </div>
              ))}
            </div>
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
