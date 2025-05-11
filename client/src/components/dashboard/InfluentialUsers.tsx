import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Influencer } from "@shared/types";

type InfluentialUsersProps = {
  influencers: Influencer[] | null;
  isLoading: boolean;
};

export default function InfluentialUsers({ influencers, isLoading }: InfluentialUsersProps) {
  // Sanitize text to remove HTML tags and invalid characters
  const sanitizeText = (text: string): string => {
    if (!text) return '';
    
    // Create a temporary div to decode HTML entities and strip HTML tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    
    // Get text content (this removes all HTML tags)
    let sanitizedText = tempDiv.textContent || '';
    
    // Replace invalid characters and control characters
    return sanitizedText
      // Remove control characters (except line breaks and tabs)
      .replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
      // Replace HTML entities that might have been missed
      .replace(/&[^;]+;/g, ' ');
  };
  
  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "youtube":
        return <span className="material-icons text-sm text-red-600">play_arrow</span>;
      case "twitter":
      case "twitter (x)":
        return <span className="material-icons text-sm text-blue-600">tag</span>;
      case "facebook":
        return <span className="material-icons text-sm text-blue-600">facebook</span>;
      case "instagram":
        return <span className="material-icons text-sm text-pink-600">camera_alt</span>;
      default:
        return <span className="material-icons text-sm text-gray-600">chat</span>;
    }
  };

  // Get sentiment color for progress bar
  const getSentimentColor = (sentiment: { positive: number; neutral: number; negative: number }) => {
    if (sentiment.positive > sentiment.negative && sentiment.positive > sentiment.neutral) {
      return "bg-green-500";
    } else if (sentiment.negative > sentiment.positive && sentiment.negative > sentiment.neutral) {
      return "bg-red-500";
    }
    return "bg-gray-500";
  };

  // Get dominant sentiment value for display
  const getDominantSentiment = (sentiment: { positive: number; neutral: number; negative: number }) => {
    if (sentiment.positive > sentiment.negative && sentiment.positive > sentiment.neutral) {
      return { type: "Positive", value: sentiment.positive };
    } else if (sentiment.negative > sentiment.positive && sentiment.negative > sentiment.neutral) {
      return { type: "Negative", value: sentiment.negative };
    }
    return { type: "Neutral", value: sentiment.neutral };
  };

  return (
    <Card className="bg-white rounded-lg shadow mb-6">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium">Influential Commenters</h3>
      </div>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Sentiment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  {[1, 2, 3].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 animate-pulse"></div>
                          <div>
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 w-16 bg-gray-200 rounded mt-1 animate-pulse"></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : influencers && influencers.length > 0 ? (
                influencers.map((influencer, index) => {
                  const dominantSentiment = getDominantSentiment(influencer.sentiment);
                  
                  return (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center text-gray-600">
                            <span className="material-icons text-sm">person</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{sanitizeText(influencer.name)}</div>
                            <div className="text-xs text-gray-500">@{sanitizeText(influencer.handle)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center">
                          <div className="platform-icon bg-gray-100 rounded-full mr-2 w-5 h-5 flex items-center justify-center">
                            {getPlatformIcon(influencer.platform)}
                          </div>
                          {sanitizeText(influencer.platform)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{influencer.commentCount}</TableCell>
                      <TableCell className="text-sm">{sanitizeText(influencer.engagementLevel)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${getSentimentColor(influencer.sentiment)} h-2 rounded-full`} 
                              style={{ width: `${dominantSentiment.value}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs font-medium text-gray-900">
                            {dominantSentiment.value}% {dominantSentiment.type}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <span className="material-icons text-gray-400 text-3xl mb-2">people</span>
                    <p className="text-gray-500">No influential users found. Run an analysis to see results.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
