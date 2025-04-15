// Types for the frontend

export type Comment = {
  id: number;
  platform: string;
  userName: string;
  userId?: string;
  text: string;
  translation?: string;
  language: string;
  sentiment: string;
  topics: string[];
  timeAgo: string;
  engagementScore?: number;
};

export type Influencer = {
  id?: number;
  name: string;
  handle: string;
  platform: string;
  commentCount: number;
  engagementLevel: string;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  avatar?: string;
};

export type Metrics = {
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
};

export type SearchResult = {
  keyword: string;
  timeperiod: number;
  platform: string;
  metrics: Metrics;
  sentimentTrend: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
  topicDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  platformDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  topKeywords: Array<{
    text: string;
    value: number;
  }>;
  comments: Comment[];
  influencers: Influencer[];
  aiInsights: string;
  lastUpdated: string;
  hasMoreComments: boolean;
};

export type AlertSettings = {
  negativeSentimentSpike: boolean;
  engagementVolume: boolean;
  newTopicDetection: boolean;
};
