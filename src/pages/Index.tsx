import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Satellite, Sun, Snowflake, Wind, Droplets, Frown } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-earth.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-background" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 inline-flex items-center gap-2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-card">
                <Satellite className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">NASA Space Apps Challenge 2025</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight font-heading neon-glow">
                Пойдёт Ли Дождь На Мой Парад?
              </h1>
              
              <div className="flex justify-center gap-6 mb-8">
                <Sun className="w-12 h-12 neon-icon text-weather-hot" />
                <Snowflake className="w-12 h-12 neon-icon text-weather-cold" />
                <Wind className="w-12 h-12 neon-icon text-weather-windy" />
                <Droplets className="w-12 h-12 neon-icon text-weather-humid" />
                <Frown className="w-12 h-12 neon-icon text-weather-uncomfortable" />
              </div>
              
              <p className="text-xl md:text-2xl mb-8 text-white/90 font-light italic max-w-3xl mx-auto">
                Изучите вероятность экстремальной погоды для ваших планов, используя данные наблюдения Земли NASA.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild variant="hero" size="xl" className="group">
                  <Link to="/dashboard">
                    Начать Анализ
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="xl" className="bg-white text-primary hover:bg-white/90">
                  <Link to="/about">
                    Узнать Больше
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Features Preview */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Планируйте Умнее с Данными NASA
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Десятилетия исторических климатических записей помогут вам выбрать идеальный день для ваших приключений
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Исторический Анализ",
                  description: "Доступ к десятилетиям данных наблюдения Земли NASA для понимания погодных паттернов",
                  icon: "📊"
                },
                {
                  title: "5 Ключевых Метрик",
                  description: "Отслеживание температуры, влажности, ветра и индексов комфорта для любой локации",
                  icon: "🌡️"
                },
                {
                  title: "Интерактивные Карты",
                  description: "Визуализация вероятностей погоды с красивыми тепловыми картами",
                  icon: "🗺️"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="bg-card p-6 rounded-lg shadow-card hover:shadow-hover transition-all duration-300 animate-slide-up border border-border"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Готовы Проверить Погоду?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Начните свой первый анализ погоды и откройте для себя мощь данных наблюдения Земли NASA
            </p>
            <Button asChild variant="hero" size="xl">
              <Link to="/dashboard">
                Перейти к Панели
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Данные предоставлены NASA Earth Observations (MERRA-2, MODIS, GPM)</p>
          <p className="mt-2">NASA Space Apps Challenge 2025 • MIT License</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
