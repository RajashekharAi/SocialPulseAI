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
      const page = parseInt(req.query.page as string || "1");
      
      if (!keyword) {
        return res.status(400).json({ message: "Keyword is required" });
      }

      // Search structure validation
      const searchQuery = {
        keyword,
        timeperiod,
        platform,
        userId: 1, // Default user for now
      };

      // First check if we have cached results
      const cachedResults = await storage.getSearchResultsByKeyword(keyword, timeperiod, platform);
      
      if (cachedResults && !req.query.refresh) {
        // Add pagination for comments
        const paginatedComments = await storage.getCommentsBySearchQueryId(
          cachedResults.searchQueryId,
          page,
          10
        );
        
        // Add the complete result with paginated comments
        return res.json({
          ...cachedResults,
          comments: paginatedComments,
          hasMoreComments: paginatedComments.length === 10, // If we got a full page, there might be more
        });
      }

      // Collect data from social media platforms
      const comments = await mediaCollector.collectComments(keyword, timeperiod, platform);
      
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
      
      // Return results with the first page of comments
      const firstPageComments = await storage.getCommentsBySearchQueryId(savedQuery.id, 1, 10);
      
      return res.json({
        keyword,
        timeperiod,
        platform,
        ...analytics,
        comments: firstPageComments,
        hasMoreComments: firstPageComments.length === 10,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in /api/analyze:", error);
      res.status(500).json({ message: "Failed to analyze social media data" });
    }
  });

  // Get more comments for pagination
  app.get("/api/comments", async (req, res) => {
    try {
      const queryId = parseInt(req.query.queryId as string);
      const page = parseInt(req.query.page as string || "1");
      const pageSize = parseInt(req.query.pageSize as string || "10");
      
      if (isNaN(queryId)) {
        return res.status(400).json({ message: "Valid queryId is required" });
      }
      
      const comments = await storage.getCommentsBySearchQueryId(queryId, page, pageSize);
      
      return res.json({
        comments,
        hasMore: comments.length === pageSize
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
