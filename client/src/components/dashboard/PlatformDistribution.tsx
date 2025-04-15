import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from "recharts";

type PlatformDistributionProps = {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }> | null;
  isLoading: boolean;
};

export default function PlatformDistribution({ data, isLoading }: PlatformDistributionProps) {
  // Format data for the chart
  const chartData = data?.map(item => ({
    platform: item.name,
    comments: item.value,
    fill: item.color
  }));

  return (
    <Card className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium">Comments by Platform</h3>
      </div>
      <CardContent className="p-4">
        <div className="chart-container h-[250px]">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <div className="h-40 w-full bg-gray-100 rounded animate-pulse"></div>
                <p className="text-sm text-gray-500 mt-2">
                  Loading platform distribution...
                </p>
              </div>
            </div>
          ) : chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="comments" 
                  name="Comments" 
                  isAnimationActive={true}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  No platform data available. Run an analysis to see distribution.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
