import React, { useState, useEffect, useCallback } from "react";
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
  timePeriod?: string; // Add time period prop
};

export default function SentimentTrend({ data, isLoading, timePeriod = "30" }: SentimentTrendProps) {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("daily");
  const [formattedData, setFormattedData] = useState<any[]>([]);

  // Memoize the groupDataByWeek function to prevent unnecessary recalculations
  const groupDataByWeek = useCallback((dailyData: any[]) => {
    if (!dailyData || dailyData.length === 0) return [];
    
    const weeklyData: any[] = [];
    let currentWeek: any = null;
    let weekTotal = { positive: 0, neutral: 0, negative: 0, days: 0 };

    dailyData.forEach((day, index) => {
      // Handle possible date format issues
      const date = new Date(day.date);
      if (isNaN(date.getTime())) {
        console.error("Invalid date format:", day.date);
        return;
      }
      
      const weekStart = getWeekStart(date).toISOString().split('T')[0];
      
      if (!currentWeek || currentWeek !== weekStart) {
        if (currentWeek && weekTotal.days > 0) {
          weeklyData.push({
            date: `Week of ${currentWeek}`,
            positive: Math.round(weekTotal.positive / weekTotal.days),
            neutral: Math.round(weekTotal.neutral / weekTotal.days),
            negative: Math.round(weekTotal.negative / weekTotal.days)
          });
        }
        currentWeek = weekStart;
        weekTotal = { 
          positive: day.positive, 
          neutral: day.neutral, 
          negative: day.negative, 
          days: 1 
        };
      } else {
        weekTotal.positive += day.positive;
        weekTotal.neutral += day.neutral;
        weekTotal.negative += day.negative;
        weekTotal.days += 1;
      }
      
      // Add the last week
      if (index === dailyData.length - 1 && weekTotal.days > 0) {
        weeklyData.push({
          date: `Week of ${currentWeek}`,
          positive: Math.round(weekTotal.positive / weekTotal.days),
          neutral: Math.round(weekTotal.neutral / weekTotal.days),
          negative: Math.round(weekTotal.negative / weekTotal.days)
        });
      }
    });
    
    return weeklyData;
  }, []);

  // Helper function to get the start of the week (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day); // Set to Sunday
    return d;
  };

  // Filter data to match the selected time period
  const getFilteredData = useCallback((originalData: any[] | null) => {
    if (!originalData || originalData.length === 0) return [];
    
    const now = new Date();
    const timePeriodDays = parseInt(timePeriod, 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - timePeriodDays);
    
    return originalData.filter(item => {
      const itemDate = new Date(item.date);
      return !isNaN(itemDate.getTime()) && itemDate >= cutoffDate;
    });
  }, [timePeriod]);

  // Process the data whenever it changes or timeUnit changes
  useEffect(() => {
    if (data && data.length > 0) {
      try {
        // First filter the data based on time period
        const filteredData = getFilteredData(data);
        
        // Then process the filtered data based on the selected time unit
        if (timeUnit === "daily") {
          // Ensure we have valid data
          const validData = filteredData.filter(item => {
            const date = new Date(item.date);
            return !isNaN(date.getTime());
          });
          setFormattedData(validData);
        } else {
          // Group the data by week for weekly view
          const weeklyData = groupDataByWeek(filteredData);
          setFormattedData(weeklyData);
        }
      } catch (error) {
        console.error("Error processing sentiment trend data:", error);
        setFormattedData([]);
      }
    } else {
      setFormattedData([]);
    }
  }, [data, timeUnit, groupDataByWeek, getFilteredData]);

  // Custom tooltip formatter to display percentages
  const tooltipFormatter = (value: number) => {
    return `${value}%`;
  };

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
        <div className="chart-container h-[250px]" data-chart-type="sentiment">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <div className="h-40 w-full bg-gray-100 rounded animate-pulse"></div>
                <p className="text-sm text-gray-500 mt-2">
                  Loading sentiment trends...
                </p>
              </div>
            </div>
          ) : formattedData && formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formattedData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{fontSize: 12}}
                />
                <YAxis 
                  label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                  domain={[0, 100]}
                />
                <Tooltip formatter={tooltipFormatter} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="positive" 
                  stroke="#10B981" 
                  activeDot={{ r: 8 }} 
                  name="Positive" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="neutral" 
                  stroke="#94A3B8" 
                  name="Neutral" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="negative" 
                  stroke="#EF4444" 
                  name="Negative" 
                  strokeWidth={2}
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
