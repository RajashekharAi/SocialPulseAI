import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ApiConfigProps {
  platform: string;
  description: string;
  apiKeyName: string;
  apiKey: string | null;
  websiteUrl: string;
  icon: string;
  documentationUrl: string;
  requiredForFeature: string;
  onSave: (platform: string, key: string) => void;
}

const ApiConfigCard = ({
  platform,
  description,
  apiKeyName,
  apiKey,
  websiteUrl,
  icon,
  documentationUrl,
  requiredForFeature,
  onSave,
}: ApiConfigProps) => {
  const [newApiKey, setNewApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!newApiKey.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid API Key",
        description: "API Key cannot be empty",
      });
      return;
    }

    onSave(platform.toLowerCase(), newApiKey);
    setIsEditing(false);
    setNewApiKey("");
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`material-icons mr-2 text-primary`}>{icon}</span>
            <CardTitle>{platform}</CardTitle>
          </div>
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline"
          >
            Get API Key
          </a>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-sm font-medium mb-1">Required for: {requiredForFeature}</div>
          {apiKey ? (
            <div className="flex items-center justify-between">
              <div className="bg-gray-100 px-3 py-2 rounded-md text-sm flex-1 mr-2">
                ••••••••••••{apiKey.substring(apiKey.length - 4)}
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Change
              </Button>
            </div>
          ) : isEditing ? (
            <div className="flex items-center">
              <Input
                type="text"
                placeholder={`Enter ${apiKeyName}`}
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className="flex-1 mr-2"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setNewApiKey("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="text-red-500 flex-1">
                <span className="material-icons align-text-bottom text-sm mr-1">error</span>
                Not configured
              </div>
              <Button size="sm" onClick={() => setIsEditing(true)}>
                Add Key
              </Button>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          <a
            href={documentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View API documentation
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ApiConfiguration() {
  const [apiKeys, setApiKeys] = useState<{ [key: string]: string | null }>({
    youtube: null,
    twitter: null,
    facebook: null,
    instagram: null,
  });
  const { toast } = useToast();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    // Fetch current API configuration
    apiRequest<{ [key: string]: string | null }>("GET", "/api/settings/api-keys")
      .then((data) => {
        setApiKeys(data);
      })
      .catch((error) => {
        console.error("Failed to fetch API configurations", error);
      });
  }, []);

  const handleSaveApiKey = (platform: string, key: string) => {
    apiRequest("POST", "/api/settings/api-keys", { platform, key })
      .then((response) => {
        setApiKeys((prev) => ({
          ...prev,
          [platform]: key,
        }));
        toast({
          title: "API Key Saved",
          description: `The ${platform} API key has been successfully saved.`,
        });
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Failed to save API Key",
          description: error.message || "Please try again later.",
        });
      });
  };

  return (
    <>
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <span className="material-icons">settings</span>
            API Settings
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">API Configuration</DialogTitle>
            <DialogDescription>
              Configure your social media API keys to fetch real-time data
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="social-media" className="mt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="social-media">Social Media APIs</TabsTrigger>
              <TabsTrigger value="advanced" disabled>Advanced Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="social-media" className="space-y-4">
              <div className="text-sm text-gray-700 mb-4">
                <p className="mb-2">
                  To fetch real-time data from social media platforms, you need to configure the 
                  respective API keys. Once configured, the system will automatically start using 
                  real data instead of sample data.
                </p>
                <p>
                  <strong>Note:</strong> These credentials are stored securely and used only to fetch 
                  data for analysis as requested by you.
                </p>
              </div>

              <ApiConfigCard
                platform="YouTube"
                description="YouTube Data API v3 key is used to fetch comments from YouTube videos and channels related to your search query."
                apiKeyName="API Key"
                apiKey={apiKeys.youtube}
                websiteUrl="https://console.developers.google.com/apis/library/youtube.googleapis.com"
                icon="smart_display"
                documentationUrl="https://developers.google.com/youtube/v3/docs"
                requiredForFeature="YouTube comments and sentiment analysis"
                onSave={handleSaveApiKey}
              />

              <ApiConfigCard
                platform="Twitter"
                description="Twitter API v2 Bearer Token is used to fetch tweets and replies related to your search query."
                apiKeyName="Bearer Token"
                apiKey={apiKeys.twitter}
                websiteUrl="https://developer.twitter.com/en/portal/dashboard"
                icon="chat"
                documentationUrl="https://developer.twitter.com/en/docs/twitter-api"
                requiredForFeature="Twitter conversations and engagement metrics"
                onSave={handleSaveApiKey}
              />

              <ApiConfigCard
                platform="Facebook"
                description="Facebook Graph API access token is used to fetch comments from Facebook pages and posts related to your search query."
                apiKeyName="Access Token"
                apiKey={apiKeys.facebook}
                websiteUrl="https://developers.facebook.com/tools/explorer/"
                icon="facebook"
                documentationUrl="https://developers.facebook.com/docs/graph-api"
                requiredForFeature="Facebook comments and engagement analysis"
                onSave={handleSaveApiKey}
              />

              <ApiConfigCard
                platform="Instagram"
                description="Instagram Graph API access token is used to fetch comments from Instagram posts related to your search query."
                apiKeyName="Access Token"
                apiKey={apiKeys.instagram}
                websiteUrl="https://developers.facebook.com/docs/instagram-api/getting-started"
                icon="photo_camera"
                documentationUrl="https://developers.facebook.com/docs/instagram-api"
                requiredForFeature="Instagram comments and visual content analysis"
                onSave={handleSaveApiKey}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}