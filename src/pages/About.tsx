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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About & Methodology</h1>
            <p className="text-xl text-muted-foreground">
              Understanding how we analyze extreme weather probabilities
            </p>
          </div>

          <div className="space-y-8">
            {/* Main Description */}
            <Card className="p-8 shadow-card animate-slide-up">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Our Approach</h2>
                  <p className="text-muted-foreground mb-4">
                    This application uses NASA Earth Observation data to estimate the historical likelihood 
                    of extreme weather conditions for your chosen date and location.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    It does not provide forecasts, but statistical insights based on decades of climate records. 
                    This allows you to make informed decisions about when to schedule important events.
                  </p>
                  <p className="text-muted-foreground">
                    Our analysis considers multiple meteorological parameters including temperature, humidity, 
                    wind speed, and derived comfort indices to give you a comprehensive view of potential 
                    weather conditions.
                  </p>
                </div>
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={satelliteImage} 
                    alt="NASA satellite collecting Earth observation data" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </Card>

            {/* Data Sources */}
            <Card className="p-8 shadow-card animate-slide-up">
              <h2 className="text-2xl font-bold mb-6">Data Sources</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: "MERRA-2",
                    description: "Modern-Era Retrospective analysis for Research and Applications",
                    icon: "🛰️"
                  },
                  {
                    name: "MODIS",
                    description: "Moderate Resolution Imaging Spectroradiometer",
                    icon: "📡"
                  },
                  {
                    name: "GPM",
                    description: "Global Precipitation Measurement mission",
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
              <h2 className="text-2xl font-bold mb-6">Weather Variables</h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Very Hot",
                    description: "Probability of temperatures exceeding 35°C (95°F), which can cause heat stress and discomfort.",
                    threshold: "Temperature > 35°C"
                  },
                  {
                    title: "Very Cold",
                    description: "Likelihood of temperatures dropping below 0°C (32°F), potentially causing freezing conditions.",
                    threshold: "Temperature < 0°C"
                  },
                  {
                    title: "Very Windy",
                    description: "Chance of wind speeds exceeding 10 m/s (~22 mph), which can affect outdoor activities.",
                    threshold: "Wind Speed > 10 m/s"
                  },
                  {
                    title: "Very Humid",
                    description: "Probability of relative humidity above 80%, which can make temperatures feel more extreme.",
                    threshold: "Relative Humidity > 80%"
                  },
                  {
                    title: "Uncomfortable",
                    description: "Combined index considering temperature, humidity, and wind to assess overall comfort.",
                    threshold: "Heat Index or Wind Chill threshold exceeded"
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
              <h2 className="text-2xl font-bold mb-4">Units of Measurement</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Temperature</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Celsius (°C) - Default</li>
                    <li>• Fahrenheit (°F) - Optional</li>
                    <li>• Kelvin (K) - Raw data format</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Wind Speed</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Meters per second (m/s) - Default</li>
                    <li>• Kilometers per hour (km/h)</li>
                    <li>• Miles per hour (mph)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Humidity</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Relative Humidity (%)</li>
                    <li>• Specific Humidity (g/kg)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Probability</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Percentage (0-100%)</li>
                    <li>• Based on historical occurrence</li>
                    <li>• 10+ year data window</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Learn More */}
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-4">Want to Learn More?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="nasa" asChild>
                  <a href="https://earthdata.nasa.gov" target="_blank" rel="noopener noreferrer">
                    NASA EarthData
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://www.nasa.gov/mission_pages/GPM/main/index.html" target="_blank" rel="noopener noreferrer">
                    GPM Mission
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
