import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, Cloud } from "lucide-react";
import whyImage from "@/assets/why-it-matters.jpg";

const Why = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16 animate-fade-in">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Почему Это Важно
                </h1>
                <div className="space-y-4 text-lg text-muted-foreground">
                  <p>
                    Каждый мечтает об идеальной погоде для своего особенного дня — свадьбы, концерта, 
                    горного похода. Но планета не всегда сотрудничает.
                  </p>
                  <p>
                    Наш инструмент помогает вам <span className="font-semibold text-foreground">планировать умнее</span>, используя 
                    десятилетия метеоданных NASA, чтобы выбрать лучший день для вашего приключения.
                  </p>
                  <p>
                    Понимая исторические погодные паттерны, вы можете минимизировать риск того, что экстремальные 
                    условия нарушат ваши важные моменты, и принимать обоснованные решения о том, когда 
                    планировать активности на открытом воздухе.
                  </p>
                </div>
              </div>
              
              <div className="rounded-lg overflow-hidden shadow-hover">
                <img 
                  src={whyImage} 
                  alt="Люди наслаждаются активностями на открытом воздухе при различных погодных условиях" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Use Cases */}
            <div className="mb-16 animate-slide-up">
              <h2 className="text-3xl font-bold text-center mb-12">Кто Получает Выгоду?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Организаторы Мероприятий",
                    description: "Выбирайте оптимальную дату для свадеб на открытом воздухе, фестивалей и корпоративных мероприятий, чтобы минимизировать погодные срывы.",
                    icon: Calendar,
                    examples: ["Свадьбы", "Фестивали", "Корпоративы"]
                  },
                  {
                    title: "Путешественники и Искатели Приключений",
                    description: "Планируйте походы, пляжный отдых и приключения на открытом воздухе, когда условия наиболее благоприятны.",
                    icon: MapPin,
                    examples: ["Походы", "Пляжный Отдых", "Кемпинг"]
                  },
                  {
                    title: "Организации",
                    description: "Планируйте мероприятия на открытом воздухе, спортивные события и общественные собрания с уверенностью в погодных условиях.",
                    icon: Cloud,
                    examples: ["Спортивные События", "Парады", "Общественные Собрания"]
                  }
                ].map((useCase, index) => (
                  <div 
                    key={index}
                    className="bg-card p-6 rounded-lg shadow-card hover:shadow-hover transition-all duration-300 border border-border"
                  >
                    <useCase.icon className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                    <p className="text-muted-foreground mb-4">{useCase.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {useCase.examples.map((example, i) => (
                        <span 
                          key={i}
                          className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Section */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8 md:p-12 mb-16 animate-slide-up border border-primary/20">
              <h2 className="text-3xl font-bold mb-6 text-center">Реальное Воздействие</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary">Экономические Преимущества</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Сокращение дорогостоящих отмен и переносов мероприятий</li>
                    <li>✓ Оптимизация бизнес-операций на открытом воздухе</li>
                    <li>✓ Минимизация финансовых потерь, связанных с погодой</li>
                    <li>✓ Повышение удовлетворенности клиентов через лучшее планирование</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-secondary">Безопасность и Комфорт</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Избегайте воздействия экстремальной жары или холода</li>
                    <li>✓ Защитите уязвимые группы населения от суровых условий</li>
                    <li>✓ Планируйте безопасные активности на открытом воздухе для детей и пожилых</li>
                    <li>✓ Снижайте риски для здоровья от погодных экстремумов</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-4 gap-6 mb-16 animate-slide-up">
              {[
                { number: "10+", label: "Лет Данных" },
                { number: "5", label: "Метрик Погоды" },
                { number: "365", label: "Дней Проанализировано" },
                { number: "∞", label: "Локаций" }
              ].map((stat, index) => (
                <div key={index} className="text-center p-6 bg-card rounded-lg shadow-card border border-border">
                  <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center gradient-hero rounded-lg p-12 animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Готовы Планировать Умнее?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Начните анализировать вероятности погоды для вашего следующего важного события
              </p>
              <Button asChild variant="hero" size="xl">
                <Link to="/dashboard">
                  Попробовать Сейчас
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Why;
