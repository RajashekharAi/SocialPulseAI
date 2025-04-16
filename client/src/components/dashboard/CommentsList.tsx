import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Comment } from "@shared/types";

type CommentsListProps = {
  comments: Comment[] | null;
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
};

export default function CommentsList({ comments, isLoading, onLoadMore, hasMore }: CommentsListProps) {
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("recent");

  // Apply filters to comments
  const filteredComments = comments 
    ? comments.filter(comment => {
        if (sentimentFilter === "all") return true;
        return comment.sentiment.toLowerCase() === sentimentFilter.toLowerCase();
      })
    : [];
    
  // Apply sorting
  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sortOrder === "engaging" && a.engagementScore !== undefined && b.engagementScore !== undefined) {
      return b.engagementScore - a.engagementScore;
    }
    // Default to recent sorting with null/undefined check
    if (!a.timeAgo) return 1;
    if (!b.timeAgo) return -1;
    return a.timeAgo.localeCompare(b.timeAgo);
  });

  // Get border color based on sentiment
  const getBorderColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "border-l-green-500";
      case "negative":
        return "border-l-red-500";
      case "neutral":
      default:
        return "border-l-gray-400";
    }
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
  
  // Safely handle HTML content and render links as clickable
  const sanitizeText = (text: string): React.ReactNode => {
    if (!text) return '';
    
    // First, let's create a temporary div to decode HTML entities
    const decodedText = document.createElement('div');
    decodedText.innerHTML = text;
    const textContent = decodedText.textContent || '';
    
    // Now handle links and line breaks
    // Split by the standard link pattern
    const linkPattern = /(https?:\/\/[^\s]+)/g;
    const parts = textContent.split(linkPattern);
    
    return (
      <>
        {parts.map((part, i) => {
          // If this part matches a link pattern, render it as an anchor
          if (part.match(linkPattern)) {
            return (
              <a 
                key={i} 
                href={part} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline"
              >
                {part}
              </a>
            );
          }
          
          // Replace newlines with line breaks
          return part.split('\n').map((line, j) => (
            <React.Fragment key={`${i}-${j}`}>
              {j > 0 && <br />}
              {line}
            </React.Fragment>
          ));
        })}
      </>
    );
  };

  return (
    <Card className="bg-white rounded-lg shadow mb-6">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium">Comments</h3>
        <div className="flex">
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="text-sm border border-gray-200 rounded px-2 h-8 mr-2 w-36">
              <SelectValue placeholder="Filter sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="text-sm border border-gray-200 rounded px-2 h-8 w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent First</SelectItem>
              <SelectItem value="engaging">Most Engaging</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="p-3 border border-gray-100 rounded-md animate-pulse">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-gray-200 rounded-full mr-2"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </>
          ) : sortedComments && sortedComments.length > 0 ? (
            <>
              {sortedComments.map((comment, index) => (
                <div
                  key={index}
                  className={`p-3 border border-gray-100 rounded-md hover:bg-gray-50 comment-box border-l-4 ${getBorderColor(
                    comment.sentiment
                  )}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="platform-icon bg-gray-100 rounded-full mr-2 w-5 h-5 flex items-center justify-center">
                        {getPlatformIcon(comment.platform)}
                      </div>
                      <span className="font-medium text-sm">{sanitizeText(comment.userName)}</span>
                      <span className="ml-2 text-xs text-gray-500">{sanitizeText(comment.platform)}</span>
                      <span className="ml-2 text-xs px-1 bg-gray-100 rounded text-gray-600">{sanitizeText(comment.language)}</span>
                    </div>
                    <div className="flex items-center">
                      <Badge
                        variant={
                          comment.sentiment.toLowerCase() === "positive"
                            ? "positive"
                            : comment.sentiment.toLowerCase() === "negative"
                            ? "negative"
                            : "neutral"
                        }
                        size="lg"
                        className="mr-2"
                      >
                        {comment.sentiment}
                      </Badge>
                      <span className="text-xs text-gray-500">{comment.timeAgo || "Unknown time"}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{sanitizeText(comment.text)}</p>
                  {comment.translation && (
                    <p className="text-xs text-gray-500 mt-1">
                      <em>Translation: {sanitizeText(comment.translation)}</em>
                    </p>
                  )}
                </div>
              ))}
              
              {hasMore && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={onLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Load More Comments"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <span className="material-icons text-gray-400 text-3xl mb-2">forum</span>
              <p className="text-gray-500">No comments available. Run an analysis to see comments.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
