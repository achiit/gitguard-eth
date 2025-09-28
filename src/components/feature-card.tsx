
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
}

export function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <Card className="overflow-hidden border-0 bg-gray-800/50 backdrop-blur hover:shadow-[0_0_30px_rgba(255,109,0,0.15)] transition-all duration-300 group">
      <CardContent className="p-6">
        <div 
          className={cn(
            "flex items-center justify-center h-12 w-12 rounded-full mb-4 transition-all duration-300",
            `bg-gradient-to-br ${color} bg-opacity-10`
          )}
        >
          <div className="text-white">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-medium text-white mb-3 group-hover:text-[#ff6d00] transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
