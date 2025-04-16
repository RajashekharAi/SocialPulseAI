import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type ScheduleDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (schedule: ScheduleConfig) => void;
  keyword: string;
};

export type ScheduleConfig = {
  keyword: string;
  frequency: "daily" | "weekly" | "monthly";
  email: string;
  sendReport: boolean;
  sendAlerts: boolean;
  platforms: string[];
};

export default function ScheduleDialog({ 
  isOpen, 
  onClose, 
  onSchedule,
  keyword
}: ScheduleDialogProps) {
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    keyword: keyword,
    frequency: "weekly",
    email: "",
    sendReport: true,
    sendAlerts: true,
    platforms: ["all"]
  });

  const handleChange = (field: keyof ScheduleConfig, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    onSchedule(schedule);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Analysis</DialogTitle>
          <DialogDescription>
            Set up a recurring analysis for "{keyword}" to monitor trends over time.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Analysis Frequency</Label>
            <Select
              value={schedule.frequency}
              onValueChange={(value: "daily" | "weekly" | "monthly") => 
                handleChange("frequency", value)
              }
            >
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email for Reports</Label>
            <Input
              id="email"
              type="email"
              value={schedule.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="your-email@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Platform Selection</Label>
            <div className="grid grid-cols-2 gap-2">
              {["all", "youtube", "twitter", "facebook", "instagram"].map((platform) => (
                <div key={platform} className="flex items-center gap-2">
                  <Checkbox
                    id={`platform-${platform}`}
                    checked={schedule.platforms.includes(platform)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        if (platform === "all") {
                          handleChange("platforms", ["all"]);
                        } else {
                          const newPlatforms = schedule.platforms.filter(p => p !== "all");
                          handleChange("platforms", [...newPlatforms, platform]);
                        }
                      } else {
                        handleChange(
                          "platforms",
                          schedule.platforms.filter((p) => p !== platform)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`platform-${platform}`} className="capitalize">
                    {platform === "all" ? "All Platforms" : platform}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Delivery Options</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="sendReport"
                  checked={schedule.sendReport}
                  onCheckedChange={(checked) => 
                    handleChange("sendReport", !!checked)
                  }
                />
                <Label htmlFor="sendReport">Send PDF report</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="sendAlerts"
                  checked={schedule.sendAlerts}
                  onCheckedChange={(checked) => 
                    handleChange("sendAlerts", !!checked)
                  }
                />
                <Label htmlFor="sendAlerts">Send alerts for significant changes</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}