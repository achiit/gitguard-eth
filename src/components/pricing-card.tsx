
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  onClick: () => void;
  popular?: boolean;
}

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  onClick,
  popular = false
}: PricingCardProps) {
  return (
    <Card className={cn(
      "flex flex-col h-full border-0 transition-all duration-300",
      popular 
        ? "bg-gradient-to-b from-gray-800/80 to-gray-800/40 shadow-[0_0_30px_rgba(255,159,90,0.2)] scale-105 z-10" 
        : "bg-gray-800/50 backdrop-blur hover:shadow-[0_0_20px_rgba(255,159,90,0.1)]"
    )}>
      <CardHeader className="pb-0">
        {popular && (
          <div className="py-1.5 px-3 rounded-full bg-gradient-to-r from-[#FF9F5A] to-[#FFCC66] text-sm text-white font-medium inline-block mb-2">
            Most Popular
          </div>
        )}
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <div className="mt-3 flex items-baseline">
          <span className="text-3xl font-extrabold text-white">{price}</span>
          <span className="ml-1 text-sm text-gray-400">{period}</span>
        </div>
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <ul className="mt-6 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className={cn(
                "rounded-full p-0.5 flex items-center justify-center mr-2 mt-0.5",
                popular ? "bg-gradient-to-r from-[#FF9F5A] to-[#FFCC66]" : "bg-[#FFCC66]/60"
              )}>
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button
          className={cn(
            "w-full text-white",
            popular 
              ? "bg-gradient-to-r from-[#FF9F5A] to-[#FFCC66] hover:from-[#FF9F5A]/90 hover:to-[#FFCC66]/90" 
              : "bg-gray-700 hover:bg-gray-600"
          )}
          onClick={onClick}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
