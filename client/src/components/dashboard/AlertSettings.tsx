import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

type AlertSettingProps = {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
};

const AlertSetting = ({ title, description, icon, iconColor, enabled, onToggle }: AlertSettingProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-200 rounded-md gap-3">
      <div className="flex items-start sm:items-center">
        <span className={`material-icons ${iconColor} mr-2 mt-0.5 sm:mt-0`}>{icon}</span>
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <Switch 
        checked={enabled} 
        onCheckedChange={onToggle} 
        className="self-end sm:self-center"
      />
    </div>
  );
};

type AlertSettingsProps = {
  alerts: {
    negativeSentimentSpike: boolean;
    engagementVolume: boolean;
    newTopicDetection: boolean;
  };
  onUpdateAlerts: (alerts: { [key: string]: boolean }) => void;
};

export default function AlertSettings({ alerts, onUpdateAlerts }: AlertSettingsProps) {
  const handleToggle = (alertKey: string, enabled: boolean) => {
    onUpdateAlerts({ ...alerts, [alertKey]: enabled });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
      <details className="group" open>
        <summary className="p-3 flex items-center justify-between cursor-pointer list-none">
          <div className="flex items-center">
            <span className="material-icons text-primary mr-2">notifications</span>
            <h3 className="font-medium text-gray-800">Alert Settings</h3>
          </div>
          <span className="material-icons transform group-open:rotate-180 transition-transform">
            expand_more
          </span>
        </summary>
        
        <div className="p-4 pt-0 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-4">
            Configure alerts for significant changes in sentiment or engagement
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AlertSetting
              title="Negative Sentiment Spike"
              description="Alert when negative sentiment increases by more than 15% in 24 hours"
              icon="warning"
              iconColor="text-red-500"
              enabled={alerts.negativeSentimentSpike}
              onToggle={(enabled) => handleToggle("negativeSentimentSpike", enabled)}
            />
            
            <AlertSetting
              title="Engagement Volume"
              description="Alert when comments increase by more than 200% compared to normal"
              icon="speed"
              iconColor="text-amber-500"
              enabled={alerts.engagementVolume}
              onToggle={(enabled) => handleToggle("engagementVolume", enabled)}
            />
            
            <AlertSetting
              title="New Topic Detection"
              description="Alert when a new significant topic emerges in comments"
              icon="trending_up"
              iconColor="text-primary"
              enabled={alerts.newTopicDetection}
              onToggle={(enabled) => handleToggle("newTopicDetection", enabled)}
            />
          </div>
        </div>
      </details>
    </div>
  );
}
