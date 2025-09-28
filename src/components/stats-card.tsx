
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
  trend: "up" | "down" | "neutral";
  percentage?: string;
}

export function StatsCard({ 
  icon, 
  title, 
  value, 
  description, 
  trend, 
  percentage 
}: StatsCardProps) {
  return (
    <Card className="backdrop-blur border border-gray-800/60 bg-gradient-to-br from-gray-800/60 to-gray-700/60 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-[#FF9F5A]/20 to-[#FFCC66]/20 text-white">
            {icon}
          </div>
          
          {trend === "up" && percentage && (
            <div className="flex items-center text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              {percentage}
            </div>
          )}
          
          {trend === "down" && percentage && (
            <div className="flex items-center text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs">
              <TrendingDown className="h-3 w-3 mr-1" />
              {percentage}
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-white">{value}</p>
          </div>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
