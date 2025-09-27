import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  jobTitle: string;
  avatarSrc: string;
  rating: number;
}

export function TestimonialCard({ quote, author, jobTitle, avatarSrc, rating }: TestimonialCardProps) {
  return (
    <Card className="h-full bg-gray-800/50 backdrop-blur border border-gray-700/50 hover:shadow-[0_0_30px_rgba(255,159,90,0.1)] transition-all rounded-xl overflow-hidden">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex space-x-1 mb-4">
          {Array(rating).fill(null).map((_, i) => (
            <Star key={`${i+1}`} className="h-4 w-4 fill-[#ff6d00] text-[#ff6d00]" />
          ))}
        </div>
        
        <blockquote className="text-gray-300 flex-grow mb-6">
          "{quote}"
        </blockquote>
        
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6d00] to-[#ff7900] flex items-center justify-center text-white font-semibold">
            {author.split(' ').map(name => name[0]).join('')}
          </div>
          <div className="ml-3">
            <div className="font-medium text-white">{author}</div>
            <div className="text-sm text-gray-400">{jobTitle}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
