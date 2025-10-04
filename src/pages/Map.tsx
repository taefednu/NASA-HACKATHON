import Navbar from "@/components/Navbar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

const Map = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">Interactive Weather Map</h1>
            <p className="text-muted-foreground">
              Explore weather probabilities across different locations
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <Card className="lg:col-span-1 p-6 h-fit shadow-card animate-slide-up">
              <h3 className="font-semibold mb-4">Filters</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Checkbox id="temp" defaultChecked />
                  <Label htmlFor="temp">Temperature</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="wind" defaultChecked />
                  <Label htmlFor="wind">Wind Speed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="humidity" defaultChecked />
                  <Label htmlFor="humidity">Humidity</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="comfort" />
                  <Label htmlFor="comfort">Comfort Index</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Time of Year</Label>
                <Slider defaultValue={[195]} max={365} step={1} className="mt-2" />
                <p className="text-sm text-muted-foreground">Day 195 (July 14)</p>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Legend</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-green-600" />
                    <span>0-30% probability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-500 to-orange-500" />
                    <span>30-60% probability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-red-600" />
                    <span>60-100% probability</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Map Area */}
            <div className="lg:col-span-3 animate-slide-up">
              <Card className="p-6 shadow-card">
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg h-[600px] flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <p className="text-lg font-medium mb-2">Interactive Map</p>
                    <p className="text-muted-foreground max-w-md">
                      Heatmap visualization showing weather probability distribution would appear here.
                      Click any location to see detailed statistics.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <Card className="p-4 shadow-card">
                  <h4 className="font-semibold mb-2">Selected Location</h4>
                  <p className="text-2xl font-bold text-primary">New York, NY</p>
                  <p className="text-sm text-muted-foreground">40.7128°N, 74.0060°W</p>
                </Card>
                <Card className="p-4 shadow-card">
                  <h4 className="font-semibold mb-2">Average Probability</h4>
                  <p className="text-2xl font-bold text-accent">45%</p>
                  <p className="text-sm text-muted-foreground">Extreme weather conditions</p>
                </Card>
                <Card className="p-4 shadow-card">
                  <h4 className="font-semibold mb-2">Data Points</h4>
                  <p className="text-2xl font-bold text-secondary">3,650</p>
                  <p className="text-sm text-muted-foreground">10-year historical record</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Map;
