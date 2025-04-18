import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sentimentAnalyzer } from "./services/sentimentAnalyzer";
import { mediaCollector } from "./services/mediaCollector";
import { topicExtractor } from "./services/topicExtractor";
import { z } from "zod";
import { insertSearchQuerySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Key management endpoints
  app.get("/api/settings/api-keys", async (req, res) => {
    try {
      const apiKeys = await storage.getApiKeys();
      res.json(apiKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.post("/api/settings/api-keys", async (req, res) => {
    try {
      const { platform, key } = req.body;
      
      if (!platform || !key) {
        return res.status(400).json({ message: "Platform and key are required" });
      }
      
      await storage.saveApiKey(platform, key);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving API key:", error);
      res.status(500).json({ message: "Failed to save API key" });
    }
  });
  
  // Alert settings endpoints
  app.get("/api/settings/alerts", async (req, res) => {
    try {
      const alertSettings = await storage.getAlertSettings();
      res.json(alertSettings);
    } catch (error) {
      console.error("Error fetching alert settings:", error);
      res.status(500).json({ message: "Failed to fetch alert settings" });
    }
  });
  
  app.post("/api/settings/alerts", async (req, res) => {
    try {
      const settings = req.body;
      await storage.saveAlertSettings(settings);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving alert settings:", error);
      res.status(500).json({ message: "Failed to save alert settings" });
    }
  });

  // Search/analyze endpoint
  app.get("/api/analyze", async (req, res) => {
    try {
      const keyword = req.query.keyword as string;
      const timeperiod = parseInt(req.query.timeperiod as string || "30");
      const platform = req.query.platform as string || "all";
      const isVideoTitleSearch = req.query.isVideoTitleSearch === "true";
      
      if (!keyword) {
        return res.status(400).json({ message: "Keyword is required" });
      }

      // Search structure validation
      const searchQuery = {
        keyword,
        timeperiod,
        platform,
        userId: 1, // Default user for now
        isVideoTitleSearch, // Add the video title search flag
      };

      // For video title search, we don't use cache to always get fresh data
      const shouldUseCache = !isVideoTitleSearch && !req.query.refresh;
      
      // First check if we have cached results
      const cachedResults = shouldUseCache ? 
        await storage.getSearchResultsByKeyword(keyword, timeperiod, platform) : 
        null;
      
      if (cachedResults) {
        // Get ALL comments without pagination
        const allCommentsResult = await storage.getAllCommentsBySearchQueryId(
          cachedResults.searchQueryId
        );
        
        // Add the complete result with all comments
        return res.json({
          ...cachedResults,
          comments: allCommentsResult.comments,
          totalComments: allCommentsResult.total
        });
      }

      // Collect data from social media platforms
      const comments = await mediaCollector.collectComments(keyword, timeperiod, platform, isVideoTitleSearch);
      
      // Analyze sentiment
      const analyzedComments = await sentimentAnalyzer.analyzeBatch(comments);
      
      // Extract topics
      const commentTopics = await topicExtractor.extractTopics(analyzedComments);
      
      // Save search query and get ID
      const savedQuery = await storage.saveSearchQuery(searchQuery);
      
      // Save comments to storage
      await storage.saveComments(savedQuery.id, commentTopics);
      
      // Generate analytics
      const analytics = await storage.generateAnalytics(savedQuery.id);

      // Check if this was a YouTube video search and modify the response accordingly
      let responseData = {
        keyword,
        timeperiod,
        platform,
        isVideoTitleSearch,
        ...analytics,
        lastUpdated: new Date().toISOString()
      };
      
      // Return results with ALL comments
      const allCommentsResult = await storage.getAllCommentsBySearchQueryId(savedQuery.id);
      
      // For video title search, we might want to add video metadata
      if (isVideoTitleSearch) {
        // Look for the VIDEO_METADATA "comment" that contains video details
        const metadataComment = commentTopics.find(c => c.userName === "VIDEO_METADATA");
        
        if (metadataComment) {
          try {
            const videoMetadata = JSON.parse(metadataComment.text);
            responseData = {
              ...responseData,
              videoMetadata,
              videoTitle: videoMetadata.title,
              channelTitle: videoMetadata.channelTitle,
              viewCount: videoMetadata.viewCount,
              likeCount: videoMetadata.likeCount,
              commentCount: videoMetadata.commentCount,
              videoUrl: videoMetadata.url
            };
            
            // Remove the metadata "comment" from the comments list
            const filteredComments = allCommentsResult.comments.filter(
              c => c.userName !== "VIDEO_METADATA"
            );
            
            const totalCommentsWithoutMetadata = allCommentsResult.total - 
              (allCommentsResult.comments.length - filteredComments.length);
            
            return res.json({
              ...responseData,
              comments: filteredComments,
              totalComments: totalCommentsWithoutMetadata
            });
          } catch (error) {
            console.error("Error parsing video metadata:", error);
          }
        }
      }
      
      // Default response for regular searches or if metadata parsing fails
      return res.json({
        ...responseData,
        comments: allCommentsResult.comments,
        totalComments: allCommentsResult.total
      });
    } catch (error) {
      console.error("Error in /api/analyze:", error);
      res.status(500).json({ message: "Failed to analyze social media data" });
    }
  });

  // Get ALL comments (no pagination)
  app.get("/api/comments", async (req, res) => {
    try {
      const queryId = parseInt(req.query.queryId as string);
      
      if (isNaN(queryId)) {
        return res.status(400).json({ message: "Valid queryId is required" });
      }
      
      const allCommentsResult = await storage.getAllCommentsBySearchQueryId(queryId);
      
      return res.json({
        comments: allCommentsResult.comments,
        total: allCommentsResult.total
      });
    } catch (error) {
      console.error("Error in /api/comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Custom endpoints can be added here

  const httpServer = createServer(app);
  return httpServer;
}
