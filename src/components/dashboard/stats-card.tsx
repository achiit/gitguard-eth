import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  iconBgColor: string;
  iconColor: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  iconBgColor,
  iconColor
}: StatsCardProps) {
  return (
    <Card className="shadow-[0_0_10px_0_rgba(0,0,0,0.1)] rounded-2xl border-none">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
          <div className={`${iconBgColor} rounded-md p-2`}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
        
        <p className="text-3xl font-bold text-gray-900 mt-4">{value}</p>
        
        {trend && (
          <div className={`flex items-center mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm">{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
