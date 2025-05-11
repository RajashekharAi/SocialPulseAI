import React from "react";
import { Card } from "@/components/ui/card";

type MetricProps = {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  borderColor: string;
  change: {
    value: number;
    indicator: "up" | "down";
  };
  isLoading: boolean;
};

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  iconColor, 
  borderColor, 
  change, 
  isLoading 
}: MetricProps) => {
  return (
    <Card className={`bg-white rounded-lg shadow p-4 border-l-4 ${borderColor}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-100 rounded mt-1 animate-pulse"></div>
          ) : (
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          )}
        </div>
        <div className={`${iconBgColor} rounded-full p-2`}>
          <span className={`material-icons ${iconColor}`}>{icon}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center text-xs">
        <span className={`${change.indicator === "up" ? "text-green-500" : "text-red-500"} flex items-center`}>
          <span className="material-icons text-xs mr-1">
            {change.indicator === "up" ? "arrow_upward" : "arrow_downward"}
          </span>
          {Math.abs(change.value)}%
        </span>
      </div>
    </Card>
  );
};

type MetricsCardsProps = {
  metrics: {
    totalComments: number;
    positiveSentiment: number;
    negativeSentiment: number;
    engagementRate: number;
    changes: {
      totalComments: number;
      positiveSentiment: number;
      negativeSentiment: number;
      engagementRate: number;
    };
  } | null;
  isLoading: boolean;
};

export default function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Total Comments"
        value={metrics?.totalComments.toLocaleString() || "0"}
        icon="forum"
        iconBgColor="bg-blue-50"
        iconColor="text-primary"
        borderColor="border-primary"
        change={{
          value: metrics?.changes.totalComments || 0,
          indicator: (metrics?.changes.totalComments || 0) >= 0 ? "up" : "down",
        }}
        isLoading={isLoading}
      />
      
      <MetricCard
        title="Positive Sentiment"
        value={`${metrics?.positiveSentiment || 0}%`}
        icon="sentiment_satisfied"
        iconBgColor="bg-green-50"
        iconColor="text-green-500"
        borderColor="border-green-500"
        change={{
          value: metrics?.changes.positiveSentiment || 0,
          indicator: (metrics?.changes.positiveSentiment || 0) >= 0 ? "up" : "down",
        }}
        isLoading={isLoading}
      />
      
      <MetricCard
        title="Negative Sentiment"
        value={`${metrics?.negativeSentiment || 0}%`}
        icon="sentiment_dissatisfied"
        iconBgColor="bg-red-50"
        iconColor="text-red-500"
        borderColor="border-red-500"
        change={{
          value: metrics?.changes.negativeSentiment || 0,
          indicator: (metrics?.changes.negativeSentiment || 0) <= 0 ? "up" : "down", // Inverted logic for negative sentiment
        }}
        isLoading={isLoading}
      />
      
      <MetricCard
        title="Engagement Rate"
        value={`${metrics?.engagementRate || 0}%`}
        icon="trending_up"
        iconBgColor="bg-amber-50"
        iconColor="text-amber-500"
        borderColor="border-amber-500"
        change={{
          value: metrics?.changes.engagementRate || 0,
          indicator: (metrics?.changes.engagementRate || 0) >= 0 ? "up" : "down",
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
