import React from "react";
import { Card, CardContent } from "@/components/ui/card";

type WordCloudProps = {
  data: Array<{
    text: string;
    value: number;
  }> | null;
  isLoading: boolean;
};

// Simple implementation of word cloud using font size scaling
export default function WordCloud({ data, isLoading }: WordCloudProps) {
  const maxFontSize = 32;
  const minFontSize = 12;
  
  const calculateFontSize = (value: number, max: number) => {
    return minFontSize + ((value / max) * (maxFontSize - minFontSize));
  };
  
  // Find the maximum value to scale font sizes
  const maxValue = data && data.length > 0 
    ? Math.max(...data.map(item => item.value)) 
    : 0;

  return (
    <Card className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium">Top Keywords & Phrases</h3>
      </div>
      <CardContent className="p-4">
        <div className="word-cloud h-[250px] overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <div className="h-40 w-full bg-gray-100 rounded animate-pulse"></div>
                <p className="text-sm text-gray-500 mt-2">
                  Loading top keywords...
                </p>
              </div>
            </div>
          ) : data && data.length > 0 ? (
            <div className="w-full h-full flex flex-wrap items-center justify-center p-4 overflow-hidden">
              {data.map((word, index) => (
                <div 
                  key={index} 
                  className="inline-block m-2 transition-all duration-200 hover:text-primary"
                  style={{ 
                    fontSize: `${calculateFontSize(word.value, maxValue)}px`,
                    fontWeight: word.value > (maxValue / 2) ? 'bold' : 'normal',
                    cursor: 'default',
                    color: `hsl(${(index * 40) % 360}, ${50 + (word.value / maxValue) * 30}%, ${40 + (word.value / maxValue) * 20}%)`
                  }}
                >
                  {word.text}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  No keyword data available. Run an analysis to see top keywords.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
