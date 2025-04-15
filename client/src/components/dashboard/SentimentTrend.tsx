import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

type TimeUnit = "daily" | "weekly";

type SentimentTrendProps = {
  data: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }> | null;
  isLoading: boolean;
};

export default function SentimentTrend({ data, isLoading }: SentimentTrendProps) {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("daily");

  return (
    <Card className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium">Sentiment Trend Over Time</h3>
        <Select
          value={timeUnit}
          onValueChange={(value) => setTimeUnit(value as TimeUnit)}
        >
          <SelectTrigger className="w-24 h-8 text-sm">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <CardContent className="p-4">
        <div className="chart-container h-[250px]">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <div className="h-40 w-full bg-gray-100 rounded animate-pulse"></div>
                <p className="text-sm text-gray-500 mt-2">
                  Loading sentiment trends...
                </p>
              </div>
            </div>
          ) : data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="positive" 
                  stroke="#10B981" 
                  activeDot={{ r: 8 }} 
                  name="Positive" 
                />
                <Line 
                  type="monotone" 
                  dataKey="neutral" 
                  stroke="#94A3B8" 
                  name="Neutral" 
                />
                <Line 
                  type="monotone" 
                  dataKey="negative" 
                  stroke="#EF4444" 
                  name="Negative" 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  No sentiment data available. Run an analysis to see trends.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
