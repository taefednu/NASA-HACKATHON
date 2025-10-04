import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WeatherCardProps {
  title: string;
  probability: number;
  description: string;
  icon: LucideIcon;
  variant: "hot" | "cold" | "windy" | "humid" | "uncomfortable";
}

const WeatherCard = ({ title, probability, description, icon: Icon, variant }: WeatherCardProps) => {
  const getVariantStyles = () => {
    const styles = {
      hot: "bg-gradient-to-br from-weather-hot/20 to-weather-hot/5 border-weather-hot/30",
      cold: "bg-gradient-to-br from-weather-cold/20 to-weather-cold/5 border-weather-cold/30",
      windy: "bg-gradient-to-br from-weather-windy/20 to-weather-windy/5 border-weather-windy/30",
      humid: "bg-gradient-to-br from-weather-humid/20 to-weather-humid/5 border-weather-humid/30",
      uncomfortable: "bg-gradient-to-br from-weather-uncomfortable/20 to-weather-uncomfortable/5 border-weather-uncomfortable/30",
    };
    return styles[variant];
  };

  const getIconColor = () => {
    const colors = {
      hot: "text-weather-hot",
      cold: "text-weather-cold",
      windy: "text-weather-windy",
      humid: "text-weather-humid",
      uncomfortable: "text-weather-uncomfortable",
    };
    return colors[variant];
  };

  const getSeverityColor = () => {
    if (probability >= 70) return "text-destructive";
    if (probability >= 40) return "text-accent";
    return "text-muted-foreground";
  };

  return (
    <Card className={cn(
      "p-6 shadow-card hover:shadow-hover transition-all duration-300 border-2 animate-fade-in h-full flex flex-col group",
      getVariantStyles()
    )}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
            <Icon className={cn("w-6 h-6", getIconColor())} />
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight">{title}</h3>
          </div>
        </div>
      </div>
      
      <div className="mb-6 flex-grow flex flex-col justify-center">
        <div className="text-center mb-4">
          <div className={cn("text-4xl md:text-5xl font-bold mb-3 leading-none", getSeverityColor())}>
            {probability}%
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                variant === "hot" && "bg-weather-hot",
                variant === "cold" && "bg-weather-cold",
                variant === "windy" && "bg-weather-windy",
                variant === "humid" && "bg-weather-humid",
                variant === "uncomfortable" && "bg-weather-uncomfortable"
              )}
              style={{ width: `${probability}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-border/50">
        <p className="text-sm text-muted-foreground leading-relaxed text-center">{description}</p>
      </div>
    </Card>
  );
};

export default WeatherCard;
