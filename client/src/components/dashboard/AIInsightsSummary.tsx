import React from "react";
import { Card } from "@/components/ui/card";

type AIInsightsSummaryProps = {
  summary: string | null;
  isLoading: boolean;
};

export default function AIInsightsSummary({ summary, isLoading }: AIInsightsSummaryProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="bg-blue-100 rounded-full p-2 mr-3">
          <span className="material-icons text-primary">psychology</span>
        </div>
        <div>
          <h3 className="font-medium text-gray-800 mb-1">AI-Generated Insights</h3>
          {isLoading ? (
            <div className="h-16 bg-blue-50 rounded animate-pulse"></div>
          ) : (
            <p className="text-gray-600">
              {summary || 
                "No AI insights available yet. Please run an analysis to generate insights."}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
