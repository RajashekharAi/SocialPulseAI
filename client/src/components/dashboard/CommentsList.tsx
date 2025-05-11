import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Comment } from "@shared/types";

type CommentsListProps = {
  comments: Comment[] | null;
  isLoading: boolean;
  totalComments: number;
};

export default function CommentsList({ 
  comments, 
  isLoading,
  totalComments
}: CommentsListProps) {
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");

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
    if (sortOrder === "newest") {
      // For newest first, sort by createdAt date (newer dates first)
      // Add null checks before accessing timeAgo
      if (!a.timeAgo && !b.timeAgo) return 0;
      if (!a.timeAgo) return 1;  // a is undefined, so b comes first
      if (!b.timeAgo) return -1; // b is undefined, so a comes first
      
      const dateA = new Date(a.timeAgo.replace("ago", "").trim());
      const dateB = new Date(b.timeAgo.replace("ago", "").trim());
      
      // If we can't parse dates properly, fallback to string comparison
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return a.timeAgo.localeCompare(b.timeAgo);
      }
      
      return dateB.getTime() - dateA.getTime();
    }
    // Default to recent sorting with null/undefined check
    if (!a.timeAgo) return 1;
    if (!b.timeAgo) return -1;
    return a.timeAgo.localeCompare(b.timeAgo);
  });

  // Format time ago string from timestamp or date string
  const formatTimeAgo = (timeAgo: string | undefined): string => {
    if (timeAgo) return timeAgo;
    
    // If timeAgo is not available, return an empty string
    return "";
  };

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
  
  // Safely handle text content and sanitize HTML tags and invalid characters
  const sanitizeText = (text: string): string => {
    if (!text) return '';
    
    // Create a temporary div to decode HTML entities and strip HTML tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    
    // Get text content (this removes all HTML tags)
    let sanitizedText = tempDiv.textContent || '';
    
    // Replace invalid characters and control characters
    sanitizedText = sanitizedText
      // Remove control characters (except line breaks and tabs)
      .replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
      // Replace HTML entities that might have been missed
      .replace(/&[^;]+;/g, ' ');
      
    return sanitizedText;
  };
  
  // Function to render text with clickable links but no HTML tags
  const renderTextWithLinks = (text: string): React.ReactNode => {
    if (!text) return '';
    
    // First sanitize the text
    const sanitizedText = sanitizeText(text);
    
    // Now handle links and line breaks
    const linkPattern = /(https?:\/\/[^\s]+)/g;
    const parts = sanitizedText.split(linkPattern);
    
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
        <h3 className="font-medium">Comments {totalComments > 0 ? `(${totalComments})` : ""}</h3>
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
              <SelectItem value="newest">Newest First</SelectItem>
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
              <div>
                <p className="text-sm text-gray-500 mb-3">
                  Showing all {sortedComments.length} comments
                </p>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto pr-2">
                {sortedComments.map((comment, index) => (
                  <div
                    key={index}
                    className={`p-3 border border-gray-100 rounded-md hover:bg-gray-50 comment-box border-l-4 ${getBorderColor(
                      comment.sentiment
                    )} mb-3`}
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
                        <span className="text-xs text-gray-500">{formatTimeAgo(comment.timeAgo)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{renderTextWithLinks(comment.text)}</p>
                    {comment.translation && (
                      <p className="text-xs text-gray-500 mt-1">
                        <em>Translation: {renderTextWithLinks(comment.translation)}</em>
                      </p>
                    )}
                  </div>
                ))}
              </div>
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
