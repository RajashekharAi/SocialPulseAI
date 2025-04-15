import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Search Queries table
export const searchQueries = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  timeperiod: integer("timeperiod").notNull(),
  platform: text("platform").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id"),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  searchQueryId: integer("search_query_id").notNull(),
  platform: text("platform").notNull(),
  userName: text("user_name").notNull(),
  userId: text("user_id"),
  text: text("text").notNull(),
  translation: text("translation"),
  language: text("language").notNull(),
  sentiment: text("sentiment").notNull(),
  topics: text("topics").array(),
  engagementScore: integer("engagement_score"),
  createdAt: timestamp("created_at").notNull(),
  collectedAt: timestamp("collected_at").defaultNow(),
  sourceUrl: text("source_url"),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  isAdmin: boolean("is_admin").default(false),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics table
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  searchQueryId: integer("search_query_id").notNull(),
  metrics: jsonb("metrics").notNull(),
  sentimentTrend: jsonb("sentiment_trend").notNull(),
  topicDistribution: jsonb("topic_distribution").notNull(),
  platformDistribution: jsonb("platform_distribution").notNull(),
  topKeywords: jsonb("top_keywords").notNull(),
  aiInsights: text("ai_insights"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  alerts: jsonb("alerts").notNull(),
  preferences: jsonb("preferences").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema for inserting a search query
export const insertSearchQuerySchema = createInsertSchema(searchQueries).omit({
  id: true, 
  createdAt: true
});

// Schema for inserting a comment
export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true, 
  collectedAt: true
});

// Schema for inserting a user
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isAdmin: true,
  lastLogin: true,
  createdAt: true
});

// Schema for inserting analytics
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true
});

// Schema for inserting settings
export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Types
export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type SearchQuery = typeof searchQueries.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type User = typeof users.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
export type Settings = typeof settings.$inferSelect;
