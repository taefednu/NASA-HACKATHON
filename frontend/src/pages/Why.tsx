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
                  Why It Matters
                </h1>
                <div className="space-y-4 text-lg text-muted-foreground">
                  <p>
                    Everyone dreams of perfect weather for their special day—a wedding, concert, 
                    mountain hike. But the planet doesn't always cooperate.
                  </p>
                  <p>
                    Our tool helps you <span className="font-semibold text-foreground">plan smarter</span>, using 
                    decades of NASA weather data to choose the best day for your adventure.
                  </p>
                  <p>
                    By understanding historical weather patterns, you can minimize the risk of extreme 
                    conditions disrupting your important moments and make informed decisions about when 
                    to plan outdoor activities.
                  </p>
                </div>
              </div>
              
              <div className="rounded-lg overflow-hidden shadow-hover">
                <img 
                  src={whyImage} 
                  alt="People enjoying outdoor activities in various weather conditions" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Use Cases */}
            <div className="mb-16 animate-slide-up">
              <h2 className="text-3xl font-bold text-center mb-12">Who Benefits?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Event Organizers",
                    description: "Choose optimal dates for outdoor weddings, festivals, and corporate events to minimize weather disruptions.",
                    icon: Calendar,
                    examples: ["Weddings", "Festivals", "Corporate Events"]
                  },
                  {
                    title: "Travelers & Adventure Seekers",
                    description: "Plan hikes, beach vacations, and outdoor adventures when conditions are most favorable.",
                    icon: MapPin,
                    examples: ["Hiking", "Beach Vacation", "Camping"]
                  },
                  {
                    title: "Organizations",
                    description: "Schedule outdoor events, sports competitions, and community gatherings with confidence in weather conditions.",
                    icon: Cloud,
                    examples: ["Sports Events", "Parades", "Community Gatherings"]
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
              <h2 className="text-3xl font-bold mb-6 text-center">Real Impact</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary">Economic Benefits</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Reduce costly event cancellations and rescheduling</li>
                    <li>✓ Optimize outdoor business operations</li>
                    <li>✓ Minimize weather-related financial losses</li>
                    <li>✓ Increase customer satisfaction through better planning</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-secondary">Safety & Comfort</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Avoid exposure to extreme heat or cold</li>
                    <li>✓ Protect vulnerable populations from harsh conditions</li>
                    <li>✓ Plan safe outdoor activities for children and elderly</li>
                    <li>✓ Reduce health risks from weather extremes</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-4 gap-6 mb-16 animate-slide-up">
              {[
                { number: "10+", label: "Years of Data" },
                { number: "5", label: "Weather Metrics" },
                { number: "365", label: "Days Analyzed" },
                { number: "∞", label: "Locations" }
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
                Ready to Plan Smarter?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Start analyzing weather probabilities for your next important event
              </p>
              <Button asChild variant="hero" size="xl">
                <Link to="/dashboard">
                  Try Now
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
