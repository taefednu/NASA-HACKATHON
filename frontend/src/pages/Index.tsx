import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Satellite, Sun, Snowflake, Wind, Droplets, Frown, BarChart3, Thermometer, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-earth.jpg";

const Index = () => {
  // Generate random stars for animation
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
  }));

  // Generate stars for CTA section
  const ctaStars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 3,
  }));

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" />
            {/* Star field overlay только в левой части */}
            <div className="absolute left-0 top-0 w-1/2 h-full">
              <div className="star-field absolute inset-0 opacity-60" />
            </div>
            
            {/* Animated floating stars только в левой части */}
            {stars.map((star) => (
              <motion.div
                key={star.id}
                className="absolute bg-white rounded-full pointer-events-none"
                style={{
                  left: `${star.x / 2}%`, // Делим на 2, чтобы звезды были только в левой половине
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 4,
                  repeat: Infinity,
                  delay: star.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 inline-flex items-center gap-2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-card">
                <Satellite className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">NASA Space Apps Challenge 2025</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight font-heading">
                Пойдёт Ли Дождь На Мой Парад?
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 text-white/90 font-light italic max-w-3xl mx-auto">
                Изучите вероятность экстремальной погоды для ваших планов, используя данные наблюдения Земли NASA.
              </p>
              
              <div className="flex justify-center mb-8">
                <Button asChild variant="hero" size="xl" className="group bg-orange-500 hover:bg-orange-400 text-white font-semibold shadow-lg shadow-orange-500/60 hover:shadow-orange-500/80 hover:shadow-2xl border-2 border-orange-400 hover:border-orange-300 transition-all duration-300 transform hover:scale-105">
                  <Link to="/dashboard">
                    Начать Анализ
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div className="flex justify-center gap-2 mb-4 flex-wrap px-6 py-2">
                {/* Жара */}
                <motion.div 
                  className="bg-orange-500/50 backdrop-blur-md px-6 py-2 rounded-md border border-orange-400/70 flex items-center gap-2 hover:bg-orange-500/60 hover:border-orange-400/90 transition-all duration-300 cursor-pointer shadow-lg shadow-orange-500/35 hover:shadow-orange-500/55 w-[130px] justify-center neon-orange"
                  animate={{
                    y: [0, -8, 2, 0],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                >
                  <Sun className="w-4 h-4 text-orange-200 drop-shadow-lg flex-shrink-0" />
                  <span className="text-xs font-normal text-orange-100 drop-shadow-lg">Жара</span>
                </motion.div>
                
                {/* Холод */}
                <motion.div 
                  className="bg-cyan-400/30 backdrop-blur-md px-6 py-2 rounded-md border border-cyan-300/50 flex items-center gap-2 hover:bg-cyan-400/40 hover:border-cyan-300/70 transition-all duration-300 cursor-pointer shadow-lg shadow-cyan-400/25 hover:shadow-cyan-400/40 w-[130px] justify-center neon-cyan"
                  animate={{
                    y: [0, -8, 2, 0],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <Snowflake className="w-4 h-4 text-cyan-200 drop-shadow-lg flex-shrink-0" />
                  <span className="text-xs font-normal text-cyan-100 drop-shadow-lg">Холод</span>
                </motion.div>
                
                {/* Ветер */}
                <motion.div 
                  className="bg-green-400/30 backdrop-blur-md px-6 py-2 rounded-md border border-green-300/50 flex items-center gap-2 hover:bg-green-400/40 hover:border-green-300/70 transition-all duration-300 cursor-pointer shadow-lg shadow-green-400/25 hover:shadow-green-400/40 w-[130px] justify-center neon-green"
                  animate={{
                    y: [0, -8, 2, 0],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                  <Wind className="w-4 h-4 text-green-200 drop-shadow-lg flex-shrink-0" />
                  <span className="text-xs font-normal text-green-100 drop-shadow-lg">Ветер</span>
                </motion.div>
                
                {/* Влага */}
                <motion.div 
                  className="bg-purple-400/30 backdrop-blur-md px-6 py-2 rounded-md border border-purple-300/50 flex items-center gap-2 hover:bg-purple-400/40 hover:border-purple-300/70 transition-all duration-300 cursor-pointer shadow-lg shadow-purple-400/25 hover:shadow-purple-400/40 w-[130px] justify-center neon-purple"
                  animate={{
                    y: [0, -8, 2, 0],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                >
                  <Droplets className="w-4 h-4 text-purple-200 drop-shadow-lg flex-shrink-0" />
                  <span className="text-xs font-normal text-purple-100 drop-shadow-lg">Влага</span>
                </motion.div>
                
                {/* Дискомфорт */}
                <motion.div 
                  className="bg-yellow-400/30 backdrop-blur-md px-6 py-2 rounded-md border border-yellow-300/50 flex items-center gap-2 hover:bg-yellow-400/40 hover:border-yellow-300/70 transition-all duration-300 cursor-pointer shadow-lg shadow-yellow-400/25 hover:shadow-yellow-400/40 w-[130px] justify-center neon-yellow"
                  animate={{
                    y: [0, -8, 2, 0],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                >
                  <Frown className="w-4 h-4 text-yellow-200 drop-shadow-lg flex-shrink-0" />
                  <span className="text-xs font-normal text-yellow-100 drop-shadow-lg">Дискомфорт</span>
                </motion.div>
              </div>
            </div>
          </div>
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
                  icon: BarChart3
                },
                {
                  title: "5 Ключевых Метрик",
                  description: "Отслеживание температуры, влажности, ветра и индексов комфорта для любой локации",
                  icon: Thermometer
                },
                {
                  title: "Интерактивные Карты",
                  description: "Визуализация вероятностей погоды с красивыми тепловыми картами",
                  icon: MapPin
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="bg-card p-6 rounded-lg shadow-card hover:shadow-hover transition-all duration-300 animate-slide-up border border-border"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <feature.icon className="w-12 h-12 mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative bg-gradient-to-br from-gray-900 via-slate-950 to-gray-900 overflow-hidden">
          {/* Космический фон со звездами */}
          <div className="absolute inset-0">
            <div className="star-field absolute inset-0 opacity-40" />
            {/* Анимированные звезды для CTA секции */}
            {ctaStars.map((star) => (
              <motion.div
                key={star.id}
                className="absolute bg-white rounded-full pointer-events-none"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                }}
                animate={{
                  opacity: [0.1, 0.8, 0.1],
                  scale: [0.8, 1.3, 0.8],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: star.delay,
                }}
              />
            ))}
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] shadow-white/20">
              Готовы Проверить Погоду?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
              Начните свой первый анализ погоды и откройте для себя мощь данных наблюдения Земли NASA
            </p>
            <Button asChild variant="hero" size="xl" className="bg-orange-500 hover:bg-orange-400 text-white font-semibold shadow-lg shadow-orange-500/70 hover:shadow-orange-500/90 hover:shadow-2xl border-2 border-orange-400 hover:border-orange-300 transition-all duration-300 transform hover:scale-105 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]">
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
