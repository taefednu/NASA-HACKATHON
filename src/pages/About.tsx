import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import satelliteImage from "@/assets/satellite.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12 text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">О Проекте & Методология</h1>
            <p className="text-xl text-muted-foreground">
              Понимание того, как мы анализируем вероятности экстремальной погоды
            </p>
          </div>

          <div className="space-y-8">
            {/* Main Description */}
            <Card className="p-8 shadow-card animate-slide-up">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Наш Подход</h2>
                  <p className="text-muted-foreground mb-4">
                    Это приложение использует данные наблюдения Земли NASA для оценки исторической вероятности 
                    экстремальных погодных условий для выбранной даты и локации.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Оно не предоставляет прогнозы, а статистические данные на основе десятилетий климатических записей. 
                    Это позволяет принимать обоснованные решения о планировании важных событий.
                  </p>
                  <p className="text-muted-foreground">
                    Наш анализ учитывает множество метеорологических параметров, включая температуру, влажность, 
                    скорость ветра и индексы комфорта, чтобы дать полное представление о потенциальных 
                    погодных условиях.
                  </p>
                </div>
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={satelliteImage} 
                    alt="Спутник NASA, собирающий данные наблюдения Земли" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </Card>

            {/* Data Sources */}
            <Card className="p-8 shadow-card animate-slide-up">
              <h2 className="text-2xl font-bold mb-6">Источники Данных</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: "MERRA-2",
                    description: "Современный ретроспективный анализ для исследований и приложений",
                    icon: "🛰️"
                  },
                  {
                    name: "MODIS",
                    description: "Спектрорадиометр среднего разрешения",
                    icon: "📡"
                  },
                  {
                    name: "GPM",
                    description: "Миссия глобального измерения осадков",
                    icon: "🌧️"
                  }
                ].map((source, index) => (
                  <div key={index} className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-4xl mb-2">{source.icon}</div>
                    <h3 className="font-semibold mb-2">{source.name}</h3>
                    <p className="text-sm text-muted-foreground">{source.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Variables Explained */}
            <Card className="p-8 shadow-card animate-slide-up">
              <h2 className="text-2xl font-bold mb-6">Погодные Переменные</h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Очень Жарко",
                    description: "Вероятность температур выше 35°C (95°F), которые могут вызвать тепловой стресс и дискомфорт.",
                    threshold: "Температура > 35°C"
                  },
                  {
                    title: "Очень Холодно",
                    description: "Вероятность падения температур ниже 0°C (32°F), потенциально вызывающих замерзание.",
                    threshold: "Температура < 0°C"
                  },
                  {
                    title: "Очень Ветрено",
                    description: "Вероятность скорости ветра выше 10 м/с (~22 миль/ч), что может повлиять на активности на открытом воздухе.",
                    threshold: "Скорость Ветра > 10 м/с"
                  },
                  {
                    title: "Очень Влажно",
                    description: "Вероятность относительной влажности выше 80%, что может сделать температуру более экстремальной.",
                    threshold: "Относительная Влажность > 80%"
                  },
                  {
                    title: "Дискомфортно",
                    description: "Комбинированный индекс, учитывающий температуру, влажность и ветер для оценки общего комфорта.",
                    threshold: "Превышение порога теплового индекса или ощущения холода"
                  }
                ].map((variable, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4 py-2">
                    <h3 className="font-semibold text-lg mb-1">{variable.title}</h3>
                    <p className="text-muted-foreground mb-2">{variable.description}</p>
                    <p className="text-sm text-primary font-medium">{variable.threshold}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Units & Calculations */}
            <Card className="p-8 shadow-card animate-slide-up">
              <h2 className="text-2xl font-bold mb-4">Единицы Измерения</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Температура</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Цельсий (°C) - По умолчанию</li>
                    <li>• Фаренгейт (°F) - Опционально</li>
                    <li>• Кельвин (K) - Формат исходных данных</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Скорость Ветра</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Метры в секунду (м/с) - По умолчанию</li>
                    <li>• Километры в час (км/ч)</li>
                    <li>• Мили в час (миль/ч)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Влажность</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Относительная Влажность (%)</li>
                    <li>• Удельная Влажность (г/кг)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Вероятность</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Процент (0-100%)</li>
                    <li>• На основе исторических данных</li>
                    <li>• Окно данных 10+ лет</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Learn More */}
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-4">Хотите Узнать Больше?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="nasa" asChild>
                  <a href="https://earthdata.nasa.gov" target="_blank" rel="noopener noreferrer">
                    NASA EarthData
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://www.nasa.gov/mission_pages/GPM/main/index.html" target="_blank" rel="noopener noreferrer">
                    Миссия GPM
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
