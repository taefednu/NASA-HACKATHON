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
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [location, setLocation] = useState("");

  const weatherData = [
    {
      title: "Very Hot",
      probability: 42,
      description: "42% chance of heat above 35°C",
      icon: Sun,
      variant: "hot" as const,
    },
    {
      title: "Very Cold",
      probability: 15,
      description: "15% chance below 0°C",
      icon: Snowflake,
      variant: "cold" as const,
    },
    {
      title: "Very Windy",
      probability: 30,
      description: "30% chance of wind >10m/s",
      icon: Wind,
      variant: "windy" as const,
    },
    {
      title: "Very Humid",
      probability: 58,
      description: "58% chance RH >80%",
      icon: Droplets,
      variant: "humid" as const,
    },
    {
      title: "Uncomfortable",
      probability: 23,
      description: "23% chance of discomfort index > threshold",
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
            <h1 className="text-4xl font-bold mb-2">Weather Analysis Dashboard</h1>
            <p className="text-muted-foreground">
              Analyze extreme weather probabilities using NASA Earth Observation data
            </p>
          </div>

          {/* Control Panel */}
          <div className="bg-card p-6 rounded-lg shadow-card border border-border mb-8 animate-slide-up">
            <div className="grid md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Enter city or coordinates" 
                    className="pl-10"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
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
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
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
              
              <Button variant="nasa" size="lg" className="w-full">
                Analyze Conditions
              </Button>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <Button variant="outline" size="sm">
                <MapPin className="w-4 h-4 mr-2" />
                Use My Location
              </Button>
              <div className="text-sm text-muted-foreground">
                Units: <span className="font-medium">°C</span> | <span className="text-muted-foreground/60">°F</span>
              </div>
            </div>
          </div>

          {/* Results Overview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Weather Probability Overview</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
                <TabsTrigger value="download">Download Data</TabsTrigger>
              </TabsList>
              
              <TabsContent value="trends" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Historical Temperature Trend</h3>
                <div className="bg-muted/30 rounded-lg h-80 flex items-center justify-center border border-border">
                  <p className="text-muted-foreground">Interactive chart visualization would appear here</p>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  July 15 historically has a 60% chance of high humidity in this area based on 10-year records.
                </p>
              </TabsContent>
              
              <TabsContent value="map" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Interactive Heatmap</h3>
                <div className="bg-muted/30 rounded-lg h-96 flex items-center justify-center border border-border">
                  <p className="text-muted-foreground">Interactive map with heatmap overlay would appear here</p>
                </div>
              </TabsContent>
              
              <TabsContent value="download" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Export Weather Data</h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Download historical weather probability data for your selected location and date range.
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download as CSV
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download as JSON
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Data provided by NASA EarthData (MERRA-2, MODIS, GPM)
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
