import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from "recharts";

type TopicDistributionProps = {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }> | null;
  isLoading: boolean;
};

export default function TopicDistribution({ data, isLoading }: TopicDistributionProps) {
  return (
    <Card className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium">Topic Distribution</h3>
        <button className="text-sm text-primary hover:underline">
          <span className="material-icons text-sm">info</span>
        </button>
      </div>
      <CardContent className="p-4">
        <div className="chart-container h-[250px]" data-chart-type="topic">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <div className="h-40 w-full bg-gray-100 rounded animate-pulse"></div>
                <p className="text-sm text-gray-500 mt-2">
                  Loading topic distribution...
                </p>
              </div>
            </div>
          ) : data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} comments`, 'Count']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  No topic data available. Run an analysis to see topic distribution.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
